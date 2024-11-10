import { midi } from "./midi.js";
import { orca } from "./orca.js";

const orcaEl = document.body.querySelector("#orca");
let width = 0;
let height = 0;

setInterval(() => {
    orca.run();
    midi.run();
    render();
}, 125);

const render = () => {
    orcaEl.innerText = orca.toString();
}

const renderMessage = (message) => {
    orca.reset(Math.max(width, message.length), Math.max(height, 4));
    orca.writeBlock(0, 0, message);
    render();
}

try {
    renderMessage(" I # Loading #")
    const resource = new URLSearchParams(window.location.search).get("resource");

    if (!resource) {
        throw new Error("Missing required parameter :resource:");
    }

    const response = await fetch(resource);
    const text = await response.text();
    const lines = text.split("\n");

    width = lines[0].length;
    height = lines.length;

    renderMessage(" I # Loading Soundfont #");
    await new Promise((resolve) => {
        MIDI.loadPlugin({
            soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FatBoy/",
            instruments: new Array(16).fill().map((_, i) => i).concat(118),
            onsuccess: () => {
                MIDI.setInstrument(9, 118)
                resolve();
            }
        })
    });


    await new Promise((resolve) => {
        orcaEl.classList.add("ready");
        renderMessage(" D # Click to play #")
        orcaEl.addEventListener("click", () => {
            orcaEl.classList.remove("ready");
            resolve();
        })
    });

    orca.reset(width, height);
    orca.replace(lines.join(""));
} catch (error) {
    renderMessage(`# ${String(error)} #`);
}
