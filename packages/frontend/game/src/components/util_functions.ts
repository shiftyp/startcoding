// @ts-ignore
self.randomX = () => {
  return Math.random() * self.width + self.minX;
};

// @ts-ignore
self.randomY = () => {
  return Math.random() * self.height + self.minY;
};

export {}