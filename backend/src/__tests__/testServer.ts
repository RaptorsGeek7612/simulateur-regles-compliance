import express, { type Router } from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

export interface TestServer {
  baseUrl: string;
  close: () => Promise<void>;
}

export function startTestServer(mountPath: string, router: Router): Promise<TestServer> {
  const app = express();
  app.use(express.json());
  app.use(mountPath, router);

  const server: Server = createServer(app);
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((res) => server.close(() => res())),
      });
    });
  });
}
