function simulateGamepad () {
    const app = window.app
    app.chrome.showCursor = true
    let cursorPos = [0, 0];
    let intTabIndex = 0
    const cursorSpeedPvt = 8
    const cursorSize = 16
    let scrollSpeed = 8
    let buttonPressDelay = 500
    let stickDeadZone = 0.2
    let scrollGroup = null
    let scrollGroupY = null
    let elementFocusEnabled = true
    let start;

    let cursorSpeed = cursorSpeedPvt

    let lastButtonPress = {

    }

    var sounds = {
        Confirm: new Audio("./sounds/confirm.ogg"),
        Menu: new Audio("./sounds/btn1.ogg"),
        Hover: new Audio("./sounds/hover.ogg")
    }

    let element = document.elementFromPoint(0, 0)
    let elementType = 0

    function appLoop() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        if (!gamepads) {
            return;
        }

        var gp = gamepads[0];

        //  LEFT STICK
        if (gp.axes[0] > stickDeadZone) {
            cursorPos[0] += (gp.axes[0] * cursorSpeed)
        } else if (gp.axes[0] < -stickDeadZone) {
            cursorPos[0] += (gp.axes[0] * cursorSpeed)
        }

        if (gp.axes[1] > stickDeadZone) {
            cursorPos[1] += (gp.axes[1] * cursorSpeed)
        } else if (gp.axes[1] < -stickDeadZone) {
            cursorPos[1] += (gp.axes[1] * cursorSpeed)
        }

        if (cursorPos[0] < cursorSize) {
            cursorPos[0] = cursorSize
        }
        if (cursorPos[1] < cursorSize) {
            cursorPos[1] = cursorSize
        }
        if (cursorPos[0] > window.innerWidth - cursorSize) {
            cursorPos[0] = window.innerWidth - cursorSize
        }
        if (cursorPos[1] > window.innerHeight - cursorSize) {
            cursorPos[1] = window.innerHeight - cursorSize
        }


        // RIGHT STICK.
        if (scrollGroupY) {
            if (gp.axes[3] > stickDeadZone) {
                $(scrollGroupY).scrollTop($(scrollGroupY).scrollTop() + (gp.axes[3] * scrollSpeed))
                elementFocusEnabled = false
            } else if (gp.axes[3] < -stickDeadZone) {
                $(scrollGroupY).scrollTop($(scrollGroupY).scrollTop() + (gp.axes[3] * scrollSpeed))
                elementFocusEnabled = false
            } else {
                elementFocusEnabled = true
            }
        }



        if (scrollGroup) {
            if (gp.axes[2] > stickDeadZone) {
                $(scrollGroup).scrollLeft($(scrollGroup).scrollLeft() + (gp.axes[2] * scrollSpeed))
                elementFocusEnabled = false
            } else if (gp.axes[2] < -stickDeadZone) {
                $(scrollGroup).scrollLeft($(scrollGroup).scrollLeft() + (gp.axes[2] * scrollSpeed))
                elementFocusEnabled = false
            } else {
                elementFocusEnabled = true
            }
        }


        $(".cursor").css({
            top: cursorPos[1] + "px",
            left: cursorPos[0] + "px",
            display: "block"
        })

        // A BUTTON
        if (gp.buttons[0].pressed) {
            if (!lastButtonPress["A"]) {
                lastButtonPress["A"] = 0
            }
            if (Date.now() - lastButtonPress["A"] > buttonPressDelay) {
                lastButtonPress["A"] = Date.now()
                sounds.Confirm.play()
                if (elementType == 0) {
                    document.activeElement.dispatchEvent(new Event("click"))
                    document.activeElement.dispatchEvent(new Event("controller-click"))
                } else {
                    element.dispatchEvent(new Event("click"))
                    element.dispatchEvent(new Event("controller-click"))
                }
            }
        }

        // B BUTTON
        if (gp.buttons[1].pressed) {

            if (!lastButtonPress["B"]) {
                lastButtonPress["B"] = 0
            }
            if (Date.now() - lastButtonPress["B"] > buttonPressDelay) {
                lastButtonPress["B"] = Date.now()
                if (elementType == 0) {
                    document.activeElement.dispatchEvent(new Event("contextmenu"))
                    setTimeout(() => {
                        if ($(".menu-option").length > 0) {
                            let bounds = $(".menu-option")[0].getBoundingClientRect()
                            cursorPos[0] = bounds.left + (bounds.width / 2)
                            cursorPos[1] = bounds.top + (bounds.height / 2)
                        }
                    }, 100)
                } else {
                    element.dispatchEvent(new Event("contextmenu"))
                }
            }

        }

        // right bumper
        if (gp.buttons[5].pressed) {
            if (!lastButtonPress["RB"]) {
                lastButtonPress["RB"] = 0
            }
            if (Date.now() - lastButtonPress["RB"] > buttonPressDelay) {
                lastButtonPress["RB"] = Date.now()
                app.navigateForward()

            }
        }

        // left bumper
        if (gp.buttons[4].pressed) {
            if (!lastButtonPress["LB"]) {
                lastButtonPress["LB"] = 0
            }
            if (Date.now() - lastButtonPress["LB"] > buttonPressDelay) {
                lastButtonPress["LB"] = Date.now()
                app.navigateBack()

            }
        }



        // cursor hover
        if (elementFocusEnabled) {
            element = document.elementFromPoint(cursorPos[0], cursorPos[1])
        }

        if (element) {

            let closest = element.closest("[tabindex], input, button, a")

            // VERT SCROLL
            let scrollGroupCloY = element.closest(`[scrollaxis="y"]`)
            if (scrollGroupCloY) {
                scrollGroupY = scrollGroupCloY
            }


            //  HOZ SCROLL
            let scrollGroupClo = element.closest(".v-hl-container")

            if (scrollGroupClo) {
                if (scrollGroupClo.classList.contains("v-hl-container")) {
                    scrollGroup = scrollGroupClo
                    scrollGroup.style["scroll-snap-type"] = "unset"
                } else {
                    scrollGroup.style["scroll-snap-type"] = ""
                    scrollGroup = null
                }
            }

            if (closest) {
                elementType = 0
                closest.focus()
            } else {
                if (closest) {
                    closest.blur()
                }
                elementType = 1
                element.focus()
            }
            cursorSpeed = cursorSpeedPvt
            if (!element.classList.contains("app-chrome")
                && !element.classList.contains("app-content")) {
                cursorSpeed = cursorSpeedPvt
            }
            // console.log($._data($(element), "events"))
        } else {
            cursorSpeed = 12
        }
        // console.log(gp.axes[0], gp.axes[1])
        start = requestAnimationFrame(appLoop);
    }

// controller pairing
    notyf.error("Press the button on your controller to pair it to Cider.")
    window.addEventListener("gamepadconnected", function (e) {
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index, e.gamepad.id,
            e.gamepad.buttons.length, e.gamepad.axes.length);
        notyf.success("Pairing successful!")
        appLoop()
    }, { once: true });

    document.addEventListener("keydown", (e) => {
        sounds.Confirm.currentTime = 0
        sounds.Menu.currentTime = 0
        sounds.Hover.currentTime = 0
        let tabbable = $("[tabindex]")
        console.log(e.key)
        switch (e.key) {
            default:
                break;
            case "ArrowLeft":
                e.preventDefault()

                cursorPos[0] -= cursorSpeed
                break;
            case "ArrowRight":
                e.preventDefault()

                cursorPos[0] += cursorSpeed
                break;
            case "ArrowUp":
                e.preventDefault()

                cursorPos[1] -= cursorSpeed
                // sounds.Hover.play()
                // if (intTabIndex <= 0) {
                //     intTabIndex = 0
                // } else {
                //     intTabIndex--
                // }
                // $(tabbable[intTabIndex]).focus()
                // $("#app-content").scrollTop($(document.activeElement).offset().top)
                break;
            case "ArrowDown":
                e.preventDefault()

                cursorPos[1] += cursorSpeed
                // if (intTabIndex < tabbable.length) {
                //     intTabIndex++
                // } else {
                //     intTabIndex = tabbable.length
                // }
                // $(tabbable[intTabIndex]).focus()
                // $("#app-content").scrollTop($(document.activeElement).offset().top)
                break;
            case "c":
                app.resetState()
                break;
            case "x":
                // set cursorPos to the top right of the screen
                // sounds.Menu.play()
                if (elementType == 0) {
                    document.activeElement.dispatchEvent(new Event("contextmenu"))
                } else {
                    element.dispatchEvent(new Event("contextmenu"))
                }

                e.preventDefault()
                break;
            case "z":
                sounds.Confirm.play()
                if (elementType == 0) {
                    document.activeElement.dispatchEvent(new Event("click"))
                    document.activeElement.dispatchEvent(new Event("controller-click"))
                } else {
                    element.dispatchEvent(new Event("click"))
                    element.dispatchEvent(new Event("controller-click"))
                }

                e.preventDefault()
                break;
        }

        $(".cursor").css({
            top: cursorPos[1] + "px",
            left: cursorPos[0] + "px"
        })
        function lerp(a, b, n) {
            return (1 - n) * a + n * b
        }


        element = document.elementFromPoint(cursorPos[0], cursorPos[1])

        if (element) {
            let closest = element.closest("[tabindex], input, button, a")
            if (closest) {
                elementType = 0
                closest.focus()
            } else {
                elementType = 1
                element.focus()
            }
        }
        console.log(element)
    });
}

export {simulateGamepad}