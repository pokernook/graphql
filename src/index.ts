import { config } from "./config";
import { server } from "./server";

server.listen(config.port, () => {
  console.log(`🚀 Server ready on port ${config.port}`);
});
