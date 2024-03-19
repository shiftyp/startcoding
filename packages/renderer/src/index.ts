import { Application, Sprite, Assets } from 'pixi.js';

export const render = async () => {
  

  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container
  const app = new Application();

  await app.init({ background: '#1099bb', resizeTo: window });

  // The application will create a canvas element for you that you
  // can then insert into the DOM
  document.body.appendChild(app.canvas);

  // load the texture we need
  const texture = await Assets.load('./assets/dog.png');

  // This creates a texture from a 'bunny.png' image
  const dog = new Sprite(texture);

  // Setup the position of the bunny
  dog.x = app.renderer.width / 2;
  dog.y = app.renderer.height / 2;

  // Rotate around the center
  dog.anchor.x = 0.5;
  dog.anchor.y = 0.5;

  // Add the bunny to the scene we are building
  app.stage.addChild(dog);

  // Listen for frame updates
  app.ticker.add(() => {
    // each frame we spin the bunny around a bit
    dog.rotation += 0.01;
  });
}