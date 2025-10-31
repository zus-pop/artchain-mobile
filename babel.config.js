module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Alias @ -> root (nếu bạn đang dùng import "@/...")
      [
        "module-resolver",
        {
          root: ["./"],
          alias: { "@": "./" },
          extensions: [".tsx", ".ts", ".js", ".jsx", ".json"],
        },
      ],

      // ⚠️ ĐỂ CUỐI CÙNG
      "react-native-reanimated/plugin",
    ],
  };
};
