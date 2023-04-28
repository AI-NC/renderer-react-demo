import { Component, ReactNode } from "react";
import Renderer from "./renderer";

export default class Container extends Component {
    state: {
        open: boolean
    } = { open: false };

    render(): ReactNode {
        let onClick = () => { this.setState({ open: !this.state.open }) }
        return (
            <div style={{ height: "100%", width: "100%" }}>
                <button type="button" onClick={onClick}>Open/Close</button>
                <hr style={{width: "100%", marginTop: "3rem", marginBottom: "3rem"}}></hr>
                {(this.state.open) ? <Renderer></Renderer> : <></> }
            </div>
        )
    }
}