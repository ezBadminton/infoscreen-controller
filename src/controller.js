import JoystickController from "joystick-controller";

class Controller {
    lastJoystickPosition = null;
    timerId = null;
    url = import.meta.env.VITE_API_ENDPOINT

    handleJoystick(position) {
        var isMoving = position.x != 0 || position.y != 0;
        var wasStill = this.lastJoystickPosition === null || (this.lastJoystickPosition.x == 0 && this.lastJoystickPosition.y == 0);
        var movementStarted = isMoving && wasStill;
        var movementStopped = !isMoving && !wasStill;
        this.lastJoystickPosition = position;

        if (movementStarted) {
            this.startPeriodicSending()
        } else if (movementStopped) {
            this.stopPeriodicSending()
        }
    }

    startPeriodicSending() {
        this.sendJoysickPosition()
        this.timerId = setTimeout(() => {
            this.startPeriodicSending()
        }, 100)
    }

    stopPeriodicSending() {
        clearTimeout(this.timerId)
    }

    sendJoysickPosition() {
        var body = JSON.stringify({
            pan: {
                x: this.lastJoystickPosition.x * 0.6,
                y: this.lastJoystickPosition.y * -0.6,
            },
        })
        fetch(this.url, {
            method: "POST",
            body: body,
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
        })
    }
    
    sendZoom(zoom) {
        var body = JSON.stringify({
            zoomIn: zoom,
            zoomOut: !zoom,
        })
        fetch(this.url, {
            method: "POST",
            body: body,
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
        })
    }

    sendReset() {
        var body = JSON.stringify({
            reset: true,
        })
        fetch(this.url, {
            method: "POST",
            body: body,
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
        })
    }
}

window.handler = new Controller();
const joystick = new JoystickController({}, (position) => window.handler.handleJoystick(position));
