/**
 * React Renderer - App.tsx
 * 
 * This app is a demonstration of how to load the renderer, and how to load a local .step file by sending it directly to
 * the AI-NC API for conversion into a .golf file.
 * 
 * NOTE: This processes will change with the full release of the renderer as the .golf file will be changing from a
 * text file to a binary to reduce download sizes.
 * 
 * Copyright (c) 2023 AI-NC
 */

import { Component, ReactNode } from "react";
import { AINCRenderer } from "@ai-nc/renderer-react";
import axios from "axios"

export default class Loader extends Component {
  state: {
    /** A buffer to hold a file read from the computer. */
    buffer?: ArrayBuffer,
    /** The file after processing into a .golf file
     * 
     * **NOTE: This will be a buffered file, not a string, with future releases**
     */
    golf?: Uint8Array
  } = {};

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
    this.setState({ buffer })
    let response = await axios.post("https://api.ai-nc.com/step", buffer, { responseType: 'arraybuffer', headers: { "ainc-api-token": "YOUR_API_TOKEN_HERE" } });
    this.setState({ golf: new Uint8Array(response.data) })
  }

  render(): ReactNode {
    if (!this.state.buffer && !this.state.golf) {
      return (
        <div>
          <input type="file" onChange={(e) => this.readFile(e)} accept=".stp, .step, .tg" />
        </div>
      );
    } else if (!this.state.golf) {
      // If the buffer is full, return a loading screen until the model has been processed
      return (<div>
        <h1>Very cool loading screen</h1>
      </div>
      )
    } else {
      return (
        <div style={{ width: "100vw", height: "100vh" }}>
          <AINCRenderer buffer={this.state.golf}></AINCRenderer>
        </div>
      );
    }
  }
}