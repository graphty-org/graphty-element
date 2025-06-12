import {
    Camera,
    Scene,
    WebXRDefaultExperience,
    WebXREnterExitUIButton,
} from "@babylonjs/core";

export async function createXrButton(scene: Scene, camera: Camera): Promise<WebXRDefaultExperience | null> {
    const element = scene.getEngine().getInputElement();
    if (!element) {
        throw new Error("createXrButton couldn't find canvas");
    }

    // add enter vr / ar buttons
    addCss();
    const buttonsArray = [
        mkButton("VR", "immersive-vr", "local-floor"),
        mkButton("AR", "immersive-ar", "local-floor"),
    ];

    // no WebXR
    if (!navigator.xr) {
        // createDefaultXRExperienceAsync creates it's own overlay, but we
        // don't get that benefit here...
        const overlay = addButtonOverlay(element);

        // create html button
        const noXrBtn = document.createElement("button");
        noXrBtn.classList.add("webxr-button");
        noXrBtn.classList.add("webxr-not-available");
        noXrBtn.innerHTML = "VR / AR NOT AVAILABLE";
        overlay.appendChild(noXrBtn);
        setTimeout(() => {
            overlay.remove();
        }, 5000);

        return null;
    }

    // WebXR setup
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            customButtons: buttonsArray,
        },
        disableTeleportation: true,
        // optionalFeatures: true,
        // outputCanvasOptions: {
        //     canvasOptions: {
        //         framebufferScaleFactor: 0.5,
        //     },
        // },
    });

    xrHelper.baseExperience.onInitialXRPoseSetObservable.add((cam) => {
        // initial VR position is fine; initial AR position appears to
        // be the origin
        if (xrHelper?.baseExperience.sessionManager.sessionMode === "immersive-ar") {
            cam.setTransformationFromNonVRCamera(camera);
        }
    });

    const overlay = document.querySelector(".xr-button-overlay");
    if (overlay) {
        // position the overlay so that the buttons are visible
        (overlay as HTMLElement).style.cssText = "z-index:11;position: absolute; right: 20px;bottom: 50px;";
    }

    return xrHelper;
}

function mkButton(text: string, sessionMode?: XRSessionMode, referenceSpaceType?: XRReferenceSpaceType): WebXREnterExitUIButton {
    sessionMode = sessionMode || "immersive-vr";
    referenceSpaceType = referenceSpaceType || "local-floor";

    // create html button
    const btnElement = document.createElement("button");
    btnElement.classList.add("webxr-button");
    btnElement.classList.add("webxr-available");
    btnElement.innerHTML = text;

    // create babylon button
    const xrBtn = new WebXREnterExitUIButton(btnElement, sessionMode, referenceSpaceType);
    xrBtn.update = function(activeButton: WebXREnterExitUIButton | null) {
        if (activeButton === null) {
            // not active, show button and remove presenting style (if present)
            btnElement.style.display = "";
            btnElement.classList.remove("webxr-presenting");
        } else if (activeButton === xrBtn) {
            // this button is active, change it to presenting
            btnElement.style.display = "";
            btnElement.classList.add("webxr-presenting");
        } else {
            // some button is active, but not this one... hide this button
            btnElement.style.display = "none";
        }
    };

    return xrBtn;
}

function addCss() {
    const css = `
    .webxr-button {
        font-family: 'Verdana', sans-serif;
        font-size: 1em;
        font-weight: bold;
        color: white;
        border: 2px solid white;
        padding: 4px 16px 4px 16px;
        margin-left: 10px;
        border-radius: 8px;
    }

    .webxr-available {
        background: black;
        box-shadow:0 0 0 0px white, 0 0 0 2px black;
    }

    .webxr-presenting {
        background: red;
    }

    .webxr-presenting::before {
        content: "EXIT ";
    }

    .webxr-not-available {
        background: grey;
        box-shadow:0 0 0 0px white, 0 0 0 2px grey;
    }

    .webxr-available:hover {
        transform: scale(1.05);
    } 

    .webxr-available:active {
        background-color: rgba(51,51,51,1);
    } 
    
    .webxr-available:focus {
        background-color: rgba(51,51,51,1);
    }
    
    canvas {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        outline: none;
        -webkit-tap-highlight-color: rgba(255, 255, 255, 0); /* mobile webkit */
    }`;

    const style = document.createElement("style");
    style.appendChild(document.createTextNode(css));
    document.getElementsByTagName("head")[0].appendChild(style);
}

function addButtonOverlay(renderCanvas: Element): HTMLElement {
    const overlay = document.createElement("div");
    overlay.classList.add("xr-button-overlay");
    overlay.style.cssText = "z-index:11;position: absolute; right: 20px;bottom: 50px;";
    // const renderCanvas = g.scene.getEngine().getInputElement();
    if (renderCanvas && renderCanvas.parentNode) {
        renderCanvas.parentNode.appendChild(overlay);
    }

    return overlay;
}
