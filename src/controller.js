import JoystickController from "joystick-controller";

class Controller {
    constructor() {
        this.lastJoystickPosition = null;
        this.timerId = null;
        this.api_endpoint = import.meta.env.VITE_API_ENDPOINT;

        var url = new URL(window.location.href);
        this.token = url.searchParams.get("token");

        this.fetchInfoItems();
    }

    async fetchInfoItems() {
        const response = await fetch(this.api_endpoint + "/items", {
            method: "GET",
            headers: { "Authorization": this.token },
        });
        if (!this.checkResponseForEndOfSession(response)) {
            return;
        }
        if (response.ok) {
            const infoItems = await response.json();
            const select = document.querySelector("#competition-select")
            for(const [id, displayName] of Object.entries(infoItems).reverse()) {
                let option = document.createElement("option");
                option.setAttribute("value", id);
                option.textContent = displayName;
                select.appendChild(option);
            }
        }
    }

    handleJoystick(position) {
        var isMoving = position.x != 0 || position.y != 0;
        var wasStill = this.lastJoystickPosition === null || (this.lastJoystickPosition.x == 0 && this.lastJoystickPosition.y == 0);
        var movementStarted = isMoving && wasStill;
        var movementStopped = !isMoving && !wasStill;
        this.lastJoystickPosition = position;

        if (movementStarted) {
            this.startPeriodicSending();
        } else if (movementStopped) {
            this.stopPeriodicSending();
        }
    }

    startPeriodicSending() {
        this.sendJoysickPosition()
        this.timerId = setTimeout(() => {
            this.startPeriodicSending()
        }, 100);
    }

    stopPeriodicSending() {
        clearTimeout(this.timerId);
    }

    sendJoysickPosition() {
        var body = JSON.stringify({
            pan: {
                x: this.lastJoystickPosition.x * 0.6,
                y: this.lastJoystickPosition.y * -0.6,
            },
        });
        this.sendPost(body);
    }

    sendZoom(zoom) {
        var body = JSON.stringify({
            zoomIn: zoom,
            zoomOut: !zoom,
        });
        this.sendPost(body);
    }

    sendReset() {
        var body = JSON.stringify({
            reset: true,
        });
        this.sendPost(body);
    }
    
    sendSelected(option) {
        var body = JSON.stringify({
            select: option.value,
        });
        this.sendPost(body);
    }

    async sendPost(body) {
        const response = await fetch(this.api_endpoint + "/control", {
            method: "POST",
            body: body,
            headers: {
                "Authorization": this.token,
                "Content-type": "application/json; charset=UTF-8"
            },
        });
        this.checkResponseForEndOfSession(response);
    }

    checkResponseForEndOfSession(response) {
        const ended = response.status === 401
        if (ended) {
            document.querySelector("#end-dialog").showModal();
        }
        return !ended
    }
}

window.handler = new Controller();
const joystick = new JoystickController({}, (position) => window.handler.handleJoystick(position));
