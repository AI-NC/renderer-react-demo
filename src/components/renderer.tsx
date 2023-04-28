/**
 * React Renderer - renderer.tsx
 * 
 * This app is a demonstration of how to load the renderer, and how to load a local .step file by sending it directly to
 * the AI-NC API for conversion into a .golf file.
 * 
 * Copyright (c) 2023 AI-NC
 */

import React, { Component, ReactNode, RefObject } from "react";
import axios from "axios"
// @ts-ignore
import { GolfRendererClient } from "http://localhost:8000/client.js";

export default class Renderer extends Component {
  /** The Iframe the renderer is contained in */
  iframe: RefObject<HTMLIFrameElement> = React.createRef();
  state: {
    /** A buffer to hold a file read from the computer. */
    buffer?: ArrayBuffer,
    /** The file after processing into a .golf file */
    golf?: Uint8Array
    /** Is the renderer loaded and ready to receive commands */
    ready: boolean
    /** The renderer client */
    client?: any
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

  async componentDidMount() {
    console.log(this.iframe)
    let iframe = this.iframe.current;
    let eventHandler = this;
    let debug = true;
    if (iframe) {
      /*
      Here we create a new client, giving them the iframe, the event handler (in this case that is 'this' the Renderer
      component), and a boolean to indicate if we want to log debug messages
      */
      let client = new GolfRendererClient(iframe, eventHandler, debug);
      await client.connect();
      this.setState({ client })
    }

  }

  /**
   * An function that gets a .golf file from the AI-NC API
   * 
   * @param buffer A buffer containing the bytes of the .step file to load
   */
  async process_file(buffer: ArrayBuffer) {
    this.setState({ buffer })
    let response = await axios.post(process.env.REACT_APP_API_ADDRESS as string, buffer, { responseType: 'arraybuffer', headers: { "ainc-api-token": process.env.REACT_APP_API_KEY } });
    console.log(response);
    this.state.client.loadGolf(response.data, true)
  }

  render(): ReactNode {
    return (
      <div>
        <input type="file" onChange={(e) => this.readFile(e)} accept=".stp, .step, .tg" />
        <div style={{ width: "100vw", height: "100vh" }}>
          <iframe style={{ width: "100%", height: "100%" }} frameBorder="0" ref={this.iframe} src="http://localhost:8000/"></iframe>
        </div>
      </div>
    );
  }

  ///////////////////////////////////////// Making Renderer an EventHandler ////////////////////////////////////////////
  /**
   * Because we want the to be able to change the state according to events from the renderer. We want to make this
   * react component into the event handler passed into the renderer.
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
  onSelectionChanged(event: { target?: String, selected: String[] }) {
    console.log("Selection event:", event)
  }
  /**
   * A function the renderer will use to send logging to this app
   * 
   * @param {"info"|"warn"|"error"} level - The severity of the log message
   * @param {String} message - The content of the log message
   */
  log(level: "info" | "warn" | "error", message: String) {
    console[level](message)
  }
}