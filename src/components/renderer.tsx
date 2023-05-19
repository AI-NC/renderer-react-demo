/**
 * React Renderer - renderer.tsx
 *
 * This app is a demonstration of how to load the renderer, and how to load a local .step file by sending it directly to
 * the AI-NC API for conversion into a .golf file.
 *
 * Copyright (c) 2023 AI-NC
 */

import React, { Component, ReactNode, RefObject } from "react";
import axios from "axios";
// @ts-ignore
import "https://cdn.ai-nc.com/renderer/client.js";
// import "http://localhost:8000/client.js";
import { IGolfRenderer } from "../renderer_types";

export default class Renderer extends Component {
  /** The Iframe the renderer is contained in */
  renderer: RefObject<IGolfRenderer> = React.createRef();
  state: {
    /** A buffer to hold a file read from the computer. */
    buffer?: ArrayBuffer;
    /** A helper to clean up all the listeners when unmounting the renderer */
    unsubscriber?: AbortController;
    /** Is the renderer loaded and ready to receive commands */
    ready: boolean;
  } = {
    ready: false,
  };

  /**
   * A function for reading a file from an input event into state.buffer
   *
   * @param e The input event from a file input element
   * @returns none
   */
  readFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const file = e.target.files[0];

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result instanceof ArrayBuffer) this.process_file(event.target.result);
      };

      reader.onerror = (err) => {
        reject(err);
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * An function that gets a .golf file from the AI-NC API
   *
   * @param buffer A buffer containing the bytes of the .step file to load
   */
  async process_file(buffer: ArrayBuffer) {
    this.setState({ buffer });
    let response = await axios.post(process.env.REACT_APP_API_ADDRESS as string, buffer, {
      responseType: "arraybuffer",
      headers: { Authorization: process.env.REACT_APP_API_KEY },
    });
    console.log(response);
    this.renderer.current?.commands.loadGolf(response.data, true);
  }

  render(): ReactNode {
    return (
      <div>
        <input type="file" onChange={(e) => this.readFile(e)} accept=".stp, .step, .tg" />
        <button
          onClick={(e) => {
            console.log("onclick");
            this.renderer.current?.commands.setConfig(randomConfig());
          }}
        >
          Random Config!
        </button>
        <golf-renderer
          style={{ width: "100vw", height: "100vh" }}
          ref={this.renderer}
          renderer-config={JSON.stringify(randomConfig())}
        ></golf-renderer>
      </div>
    );
  }

  ///////////////////////////////////////////// Handling Renderer Events ///////////////////////////////////////////////
  /**
   * Because we want the to be able to change the state according to events from the renderer an easy way of making sure
   * this works is to create methods on the component that we will then attach as event listeners.
   * (see https://github.com/AI-NC/renderer-react-demo/wiki/Renderer-Events for details on event handlers)
   */

  /**
   * A function that will be run when the renderer is fully loaded and ready to receive commands
   */
  onConnect() {
    console.log("Renderer successfully loaded");
    this.setState({ ready: true });
  }
  /**
   * A function that will be run when the renderer is disconnected
   */
  onDisconnect() {
    console.log("Renderer closed");
    this.setState({ ready: false });
  }
  /**
   * A function that will be run every time a model is finished loading in the renderer
   */
  onModelLoaded() {
    console.log("model loaded");
  }
  /**
   * A function that will be called while the renderer is in selection mode whenever a user clicks on a face or edge.
   *
   * @param {Object} event - A selection event
   * @param {(String | undefined)} event.target - The face/edge that was clicked on to trigger the event, or none if
   * nothing was clicked
   * @param {String[]} event.selected - All currently selected faces and edges
   */
  onSelectionChanged(event: { target?: String; selected: String[] }) {
    console.log("Selection event:", event);
  }
  /**
   * A function the renderer will use to send logging to this app
   *
   * @param {"info"|"warn"|"error"} level - The severity of the log message
   * @param {String} message - The content of the log message
   */
  log(level: "info" | "warn" | "error", message: String) {
    console[level](message);
  }

  /**
   * We then want to attach all of these event listeners to the iframe, and get the controller so we can send commands
   * to the renderer
   */
  componentDidMount() {
    console.log(this.renderer);
    let renderer = this.renderer.current;

    if (renderer) {
      // First we want to create an Unsubscriber that will remove all our listners when we pack up out component
      this.setState({ unsubscriber: new AbortController() });
      let signal = { signal: this.state.unsubscriber?.signal };

      /*
      Here hook up the listener events, you could just create the closures here, although given we want to be changing
      the renderers state it is easier to move the logic into function calls.
      
      We can also avoid any confusion with the context of `this` by explicitly calling methods on `Renderer`.
      */
      renderer.addEventListener(
        "connected",
        (event: any) => {
          this.onConnect();
        },
        signal
      );
      renderer.addEventListener(
        "disconnected",
        (event: any) => {
          this.onDisconnect();
        },
        signal
      );
      renderer.addEventListener(
        "modelLoaded",
        (event: any) => {
          this.onModelLoaded();
        },
        signal
      );
      renderer.addEventListener(
        "selectionChanged",
        (event: any) => {
          this.onSelectionChanged(event.detail);
        },
        signal
      );
      renderer.addEventListener(
        "log",
        (event: any) => {
          this.log(event.detail.level, event.detail.message);
        },
        signal
      );
    } else {
      console.error("Unable to find renderer when mounting component");
    }
  }

  /**
   * We want to remove all the listners when we unmount the component
   */
  componentWillUnmount(): void {
    this.state.unsubscriber?.abort();
  }
}

function randomConfig(): any {
  const base_color = random_bool() ? random_color() : undefined;
  const gradient_color = random_bool() ? random_color() : undefined;
  const model_color = random_bool() ? random_color() : undefined;
  const hover_color = random_bool() ? random_color() : undefined;
  const cam_sens = random_bool() ? Math.random() * 2 : undefined;
  const zoom_sens = random_bool() ? Math.random() * 2 : undefined;
  const inspection_on = random_bool() ? random_bool() : undefined;
  const watermark = random_bool() ? random_bool() : undefined;
  // const enable_variable_resolution = random_bool() ? random_bool() : undefined;

  return {
    base_color,
    gradient_color,
    model_color,
    hover_color,
    cam_sens,
    zoom_sens,
    inspection_on,
    watermark,
    // enable_variable_resolution,
  };
}

function random_bool(): boolean {
  return Math.random() > 0.5;
}

function random_color(): [number, number, number] {
  return [Math.random() * 255, Math.random() * 255, Math.random() * 255];
}
