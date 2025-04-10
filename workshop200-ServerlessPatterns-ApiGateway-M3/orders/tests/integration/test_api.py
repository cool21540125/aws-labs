import json
import requests
import logging
import time
import uuid
import pytest

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

order_1 = {
    "restaurantId": 1,
    "orderId": str(uuid.uuid4()),
    "orderItems": [
        {"id": 1, "name": "Spaghetti", "price": 9.99, "quantity": 1},
        {"id": 2, "name": "Pizza - SMALL", "price": 4.99, "quantity": 2},
    ],
    "totalAmount": 19.97,
    "status": "PLACED",
}


@pytest.fixture
def orders_endpoint(global_config):
    """Returns the endpoint for the Orders service"""
    orders_endpoint = global_config["OrdersServiceEndpoint"] + "/orders"
    logger.debug("Orders Endpoint = " + orders_endpoint)
    return orders_endpoint


@pytest.fixture
def user_token(global_config):
    """Returns the user_token for authentication to the Orders service"""
    user_token = global_config["user1UserIdToken"]
    logger.debug("     User Token = " + user_token)
    return user_token


def test_access_orders_without_authentication(orders_endpoint):
    response = requests.post(orders_endpoint)
    assert response.status_code == 401


def test_add_new_order(global_config, orders_endpoint, user_token):
    response = requests.post(
        orders_endpoint,
        data=json.dumps(order_1),
        headers={"Authorization": user_token, "Content-Type": "application/json"},
    )
    logger.debug("Add new order response: %s", response.text)
    assert response.status_code == 200
    order_info = response.json()
    order_id = order_info["orderId"]
    order_time = order_info["orderTime"]
    logger.debug("New orderId: %s", order_id)
    global_config["orderId"] = order_id
    global_config["orderTime"] = order_time
    assert order_info["status"] == "PLACED"


def test_get_order(global_config, orders_endpoint, user_token):
    url = orders_endpoint + "/" + global_config["orderId"]
    response = requests.get(
        url,
        headers={"Authorization": user_token, "Content-Type": "application/json"},
    )

    logger.debug(response.text)
    order_info = json.loads(response.text)
    assert order_info["orderId"] == global_config["orderId"]
    assert order_info["status"] == "PLACED"
    assert order_info["totalAmount"] == 19.97
    assert order_info["restaurantId"] == 1
    assert len(order_info["orderItems"]) == 2


def test_list_orders(global_config, orders_endpoint, user_token):
    response = requests.get(
        orders_endpoint,
        headers={"Authorization": user_token, "Content-Type": "application/json"},
    )
    orders = json.loads(response.text)
    assert len(orders["orders"]) == 1
    assert orders["orders"][0]["orderId"] == global_config["orderId"]
    assert orders["orders"][0]["totalAmount"] == 19.97
    assert orders["orders"][0]["restaurantId"] == 1
    assert len(orders["orders"][0]["orderItems"]) == 2


def test_edit_order(global_config, orders_endpoint, user_token):
    print(f"Modifying order {global_config['orderId']}")

    modified_order = {
        "restaurantId": 1,
        "orderItems": [
            {"id": 1, "name": "Spaghetti", "price": 9.99, "quantity": 1},
            {"id": 2, "name": "Pizza - SMALL", "price": 4.99, "quantity": 1},
            {"id": 3, "name": "Salad - LARGE", "price": 9.99, "quantity": 1},
        ],
        "totalAmount": 25.97,
        "status": "PLACED",
        "orderTime": global_config["orderTime"],
    }

    response = requests.put(
        orders_endpoint + "/" + global_config["orderId"],
        data=json.dumps(modified_order),
        headers={"Authorization": user_token, "Content-Type": "application/json"},
    )

    logger.debug(f"Modify order response: {response.text}")
    assert response.status_code == 200
    updated_order = response.json()
    assert updated_order["totalAmount"] == 25.97
    assert len(updated_order["orderItems"]) == 3


def test_cancel_order(global_config, orders_endpoint, user_token):
    print(f"Canceling order {global_config['orderId']}")
    response = requests.delete(
        orders_endpoint + "/" + global_config["orderId"],
        headers={"Authorization": user_token, "Content-Type": "application/json"},
    )

    logger.debug(f"Cancel order response: {response.text}")
    assert response.status_code == 200
    order_info = json.loads(response.text)
    assert order_info["orderId"] == global_config["orderId"]
    assert order_info["status"] == "CANCELED"


def test_cancel_order_in_wrong_status(
    global_config, orders_endpoint, user_token, acknowledge_order_hook
):
    response = requests.delete(
        orders_endpoint + "/" + global_config["ackOrderId"],
        headers={"Authorization": user_token, "Content-Type": "application/json"},
    )
    logger.debug(f"Cancel order response: {response.text}")
    # Verify OrderStatusError exception was raised because status not 'PLACED' as expected.
    assert response.status_code == 400
