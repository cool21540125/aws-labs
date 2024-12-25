from flask import Flask, render_template
import hashlib
import threading
import time

app = Flask(__name__)


def _cpu_extensive_task():
    for i in range(0, 2000):
        hashlib.md5().hexdigest()
    time.sleep(0.2)


@app.route("/")
def index():
    return "index"


@app.route("/godie")
def redirect():
    threading.Thread(target=_cpu_extensive_task).start()
    return render_template("redirect.html")


@app.route("/check")
def check():
    return {"check": "ok"}


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
