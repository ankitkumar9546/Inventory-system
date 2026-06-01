import os

os.environ["DATABASE_URL"] = "sqlite://"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client


def create_product(client, **overrides):
    payload = {
        "name": "Wireless Keyboard",
        "sku": "WK-001",
        "price": 49.99,
        "quantity": 10,
        "description": "Compact keyboard",
    }
    payload.update(overrides)
    return client.post("/products", json=payload)


def create_customer(client, **overrides):
    payload = {
        "full_name": "Ankit Kumar",
        "email": "ankit@example.com",
        "phone": "+919999999999",
    }
    payload.update(overrides)
    return client.post("/customers", json=payload)


def test_product_crud_and_unique_sku(client):
    created = create_product(client)
    assert created.status_code == 201
    product_id = created.json()["id"]

    duplicate = create_product(client)
    assert duplicate.status_code == 409

    updated = client.put(
        f"/products/{product_id}",
        json={"name": "Mechanical Keyboard", "sku": "MK-001", "quantity": 8},
    )
    assert updated.status_code == 200
    assert updated.json()["sku"] == "MK-001"
    assert updated.json()["quantity"] == 8

    deleted = client.delete(f"/products/{product_id}")
    assert deleted.status_code == 204


def test_customer_requires_valid_unique_email(client):
    created = create_customer(client, email="ANKIT@example.com")
    assert created.status_code == 201
    assert created.json()["email"] == "ankit@example.com"

    duplicate = create_customer(client, email="ankit@example.com")
    assert duplicate.status_code == 409

    invalid = create_customer(client, email="not-an-email")
    assert invalid.status_code == 422


def test_order_deducts_stock_and_restores_on_cancel(client):
    product = create_product(client, quantity=5).json()
    customer = create_customer(client).json()

    order = client.post(
        "/orders",
        json={
            "customer_id": customer["id"],
            "items": [{"product_id": product["id"], "quantity": 3}],
        },
    )
    assert order.status_code == 201
    assert order.json()["total_amount"] == 149.97

    stocked_product = client.get(f"/products/{product['id']}").json()
    assert stocked_product["quantity"] == 2

    cancelled = client.delete(f"/orders/{order.json()['id']}")
    assert cancelled.status_code == 204

    restored_product = client.get(f"/products/{product['id']}").json()
    assert restored_product["quantity"] == 5


def test_duplicate_order_lines_are_aggregated_before_stock_check(client):
    product = create_product(client, quantity=5).json()
    customer = create_customer(client).json()

    rejected = client.post(
        "/orders",
        json={
            "customer_id": customer["id"],
            "items": [
                {"product_id": product["id"], "quantity": 4},
                {"product_id": product["id"], "quantity": 4},
            ],
        },
    )
    assert rejected.status_code == 400
    assert client.get(f"/products/{product['id']}").json()["quantity"] == 5

    accepted = client.post(
        "/orders",
        json={
            "customer_id": customer["id"],
            "items": [
                {"product_id": product["id"], "quantity": 2},
                {"product_id": product["id"], "quantity": 3},
            ],
        },
    )
    assert accepted.status_code == 201
    assert accepted.json()["items"][0]["quantity"] == 5
    assert client.get(f"/products/{product['id']}").json()["quantity"] == 0
