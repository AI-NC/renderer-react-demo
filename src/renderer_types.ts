// Optional types for the renderer and its commands.

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'golf-renderer': React.DetailedHTMLProps<
                React.HTMLAttributes<IGolfRenderer>,
                IGolfRenderer
            >;
        }
    }
}

export interface IGolfRenderer extends HTMLElement {
    /** Gets a commands module for interacting with the renderer. **Will throw an error if the renderer is not connected.** */
    get commands(): IGolfRendererCommands;
}

export interface IGolfRendererCommands {
    /**
     * Load a Golf file from a buffer.
     *
     * @param golfBytes This will be a Uint8Array from the AI-NC API,
     * obtained by calling `response.arrayBuffer()` on a `fetch` response.
     *
     * @param transferOwnership An optimization for when you do not need the buffer any more
     * and therefore can move it to the golf-renderer iframe's window, without copying. It will
     * render your copy of the buffer useless. Default is false.
     */
    loadGolf(golfBytes: ArrayBuffer, transferOwnership?: boolean): void;
    /** Focus the provided faces and edges.
     *
     * Focus is a stronger highlight than identify. It applies greater opacity to other faces, and overwrites all other focus and identify commands.
     * Sending a focus event with an empty vector will clear all focus and identify events.
     * 
     * @param ids The ID of faces and edges are emitted by 'on_select' events when a user interacts with the model.
     */
    focus(ids: string[]): void;
    /**
     * Highlight the provided faces and edges.
     * Identify is a weaker highlight than focus. It applies a lower opacity to other faces, and only overwrites other identify commands.
     * Sending an Identify event with an empty vector will clear all identify events.
     * @param ids The ID of faces and edges are emitted by 'on_select' events when a user interacts with the model.
     */
    identify(ids: string[]): void;
}