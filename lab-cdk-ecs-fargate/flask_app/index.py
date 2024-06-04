from flask import Flask, render_template
import hashlib
import threading
import time

app = Flask(__name__)


@app.route("/")
def index():
    return "Hello, World!"


def cpu_extensive_task():
    for i in range(0, 100_000):
        hashlib.md5().hexdigest()
    time.sleep(0.2)


@app.route("/redirect")
def redirect():
    threading.Thread(target=cpu_extensive_task).start()
    return render_template("redirect.html")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
