import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// Middleware check token (ví dụ đơn giản)
// app.use((req, res, next) => {
//   const token = req.headers["authorization"];
//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   next();
// });

// Proxy tới User service
app.get('/', (req, res) => {
  res.send("hello api gatedndndnway");
});
app.use(
  "/users",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: { "^/users": "" },
  })
);

// Proxy tới Product service
app.use(
  "/products",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
    pathRewrite: { "^/products": "" },
  })
);

// Proxy tới Order service
app.use(
  "/orders",
  createProxyMiddleware({
    target: "http://localhost:5003",
    changeOrigin: true,
    pathRewrite: { "^/orders": "" },
  })
);

app.listen(3000, () => {
  console.log("🚀 API Gateway running at http://localhost:3000");
});
