/**
 * MockWebSocketService — simulates real-time events from other users.
 *
 * Drop-in replaceable: swap the connect() body with `new WebSocket(url)`
 * and keep the same subscribe/unsubscribe pattern.
 */
import type { WSEvent } from "../types/events";

type Subscriber = (event: WSEvent) => void;

class MockWebSocketService {
  private subscribers = new Set<Subscriber>();
  private timers: ReturnType<typeof setTimeout>[] = [];
  private connected = false;
  /**
   * BroadcastChannel lets all tabs on the same origin talk to each other.
   * Crucially, the tab that calls postMessage does NOT receive its own message,
   * so the current tab never double-applies a move it already made optimistically.
   */
  private channel: BroadcastChannel | null = null;

  connect(): void {
    if (this.connected) return;
    this.connected = true;

    // Cross-tab sync: forward incoming messages to all in-tab subscribers
    this.channel = new BroadcastChannel("pm_board");
    this.channel.onmessage = (e: MessageEvent<WSEvent>) => this.emit(e.data);

    // Simulate user_2 moving PROJ-105 after 15 seconds — demonstrates Scenario 1
    this.timers.push(
      setTimeout(() => {
        this.emit({
          event_type: "issue_moved",
          payload: {
            issue_id: "PROJ-105",
            from_column: "in_progress",
            to_column: "in_review",
            position: 0,
            moved_by: "Alex Johnson",
            timestamp: new Date().toISOString(),
          },
        });
      }, 5_000),
    );

    // Simulate a presence join after 3 seconds
    this.timers.push(
      setTimeout(() => {
        this.emit({
          event_type: "user_joined",
          payload: {
            user_id: "user_2",
            display_name: "Alex Johnson",
            avatar_url: "",
            timestamp: new Date().toISOString(),
          },
        });
      }, 3_000),
    );
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  disconnect(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.channel?.close();
    this.channel = null;
    this.connected = false;
  }

  /** Deliver an event to all in-tab subscribers */
  emit(event: WSEvent): void {
    this.subscribers.forEach((fn) => fn(event));
  }

  /**
   * Send an event to every OTHER open tab via BroadcastChannel.
   * The calling tab is excluded automatically by the browser.
   */
  broadcast(event: WSEvent): void {
    this.channel?.postMessage(event);
  }
}

// Singleton — one connection per app instance
const mockWebSocket = new MockWebSocketService();
export default mockWebSocket;
