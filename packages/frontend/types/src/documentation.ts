export default {
  "Sprites & Backgrounds": {
    Background: [
      {
        description: "Set the backdrop to a color:",
        code: 'setBackdropColor("blue")',
        tags: "backdrop background",
      },

      {
        url: "./images/beach.jpg",
        code: 'setBackdropURL("./docs/images/beach.jpg")\nsetBackdropStyle("cover")',
        tags: "beach backdrop background",
      },

      {
        url: "./images/nyc.jpg",
        code: 'setBackdropURL("./docs/images/nyc.jpg")\nsetBackdropStyle("cover")',
        tags: "new york city backdrop background",
      },

      {
        url: "./images/candyland.jpg",
        code: 'setBackdropURL("./docs/images/candyland.jpg")\nsetBackdropStyle("cover")',
        tags: "candy land backdrop background",
      },

      {
        url: "./images/boss-backdrop.jpg",
        code: 'setBackdropURL("./docs/images/boss-backdrop.jpg")\nsetBackdropStyle("cover")',
        tags: "boss space",
      },

      {
        url: "./images/minecraft.jpg",
        code: 'setBackdropURL("./docs/images/minecraft.jpg")\nsetBackdropStyle("cover")',
        tags: "minecraft backdrop background",
      },

      {
        url: "./images/snow.jpg",
        code: 'setBackdropURL("./docs/images/snow.jpg")\nsetBackdropStyle("cover")',
        tags: "snow mountain backdrop background",
      }, {
        url: "./images/outerspace.jpg",
        code: 'setBackdropURL("./docs/images/outerspace.jpg")\nsetBackdropStyle("cover")',
        tags: "outer space mountain backdrop background",
      },

      {
        url: "./images/ocean.jpg",
        code: 'setBackdropURL("./docs/images/ocean.jpg")\nsetBackdropStyle("cover")',
        tags: "ocean backdrop background sea",
      },

      {
        url: "./images/bubbles-backdrop.jpeg",
        code: 'setBackdropURL("./docs/images/bubbles-backdrop.jpeg")\nsetBackdropStyle("cover")',
        tags: "bubble",
      },

      {
        url: "./images/rr-backdrop.jpg",
        code: 'setBackdropURL("./docs/images/rr-backdrop.jpg")\nsetBackdropStyle("cover")',
        tags: "grass",
      },

      {
        url: "./images/tomato-attack-backdrop.jpg",
        code: 'setBackdropURL("./docs/images/tomato-attack-backdrop.jpg")\nsetBackdropStyle("cover")',
        tags: "tomato outdoors",
      },

      {
        url: "./images/war-backdrop.png",
        code: 'setBackdropURL("./docs/images/war-backdrop.png")\nsetBackdropStyle("cover")',
        tags: "blue",
      },

      {
        url: "./images/hungrycrab-backdrop.jpg",
        code: 'setBackdropURL("./docs/images/hungrycrab-backdrop.jpg")\nsetBackdropStyle("cover")',
        tags: "ocean water",
      },

      {
        url: "./images/platformer-backdrop1.png",
        code: 'setBackdropURL("./docs/images/platformer-backdrop1.png")\nsetBackdropStyle("cover")',
        tags: "platform mountain",
      },

      {
        url: "./images/platformer-backdrop2.png",
        code: 'setBackdropURL("./docs/images/platformer-backdrop2.png")\nsetBackdropStyle("cover")',
        tags: "tree mountain outside",
      },

      {
        url: "./images/emojibackground.jpg",
        code: 'setBackdropURL("./docs/images/emojibackground.jpg")\nsetBackdropStyle("cover")',
        tags: "emoji backdrop background",
      },

      {
        url: "./images/galaxy.jpg",
        code: 'setBackdropURL("./docs/images/galaxy.jpg")\nsetBackdropStyle("cover")',
        tags: "galaxy outer space backdrop background",
      },

      {
        url: "./images/harrypotter.jpg",
        code: 'setBackdropURL("./docs/images/harrypotter.jpg")\nsetBackdropStyle("cover")',
        tags: "harry potter backdrop background",
      },

      {
        url: "./images/starwars.jpg",
        code: 'setBackdropURL("./docs/images/starwars.jpg")\nsetBackdropStyle("cover")',
        tags: "star wars backdrop background",
      },

      {
        url: "./images/marioback.jpg",
        code: 'setBackdropURL("./docs/images/marioback.jpg")\nsetBackdropStyle("cover")',
        tags: "mario background backdrop",
      },

      {
        url: "./images/soccer.jpg",
        code: 'setBackdropURL("./docs/images/soccer.jpg")\nsetBackdropStyle("cover")',
        tags: "soccer background backdrop",
      },

      {
        url: "./images/flappyback.png",
        code: 'setBackdropURL("./docs/images/flappyback.png")\nsetBackdropStyle("cover")',
        tags: "flappy bird background backdrop",
      },

      {
        url: "./images/desert.jpg",
        code: 'setBackdropURL("./docs/images/desert.jpg")\nsetBackdropStyle("cover")',
        tags: "desert background backdrop",
      },

      {
        url: "./images/grass.jpg",
        code: 'setBackdropURL("./docs/images/grass.jpg")\nsetBackdropStyle("cover")',
        tags: "golf grass background backdrop",
      },

    ],
    Text: [
      {
        description: "Create new text:",
        code: 'var textSprite1 = new Text()\ntextSprite1.text = () => "Hello World!"\ntextSprite1.size = 12\ntextSprite1.color = "rgb(100, 50, 240)"',
        tags: 'create make new text words string'
      },
      {
        description: "Set location:",
        code: "textSprite1.x = 50\ntextSprite1.y = -100",
        tags: "text words string location x y"
      },
      {
        description: "Set color:",
        code: "textSprite1.color = rgb(100, 50, 240)",
        tags: "text font words string color"
      },
      {
        description: "Set font:",
        code: "textSprite1.fontFamily = 'arial'",
        tags: "text words string font family"
      },
      {
        description: "Text alignment:",
        html: "<img src=\"./images/textAlign.png\"><p>The red line is where the x value of the text is.</p>",
        code: 'textSprite1.textAlign = "start"\ntextSprite1.textAlign = "end"\ntextSprite1.textAlign = "left"\ntextSprite1.textAlign = "center"\ntextSprite1.textAlign = "right"',
        tags: "text font words string alignment left center right start end"
      },
      {
        description: "Font size",
        code: "textSprite1.size = 12",
        tags: "text font words string size"
      }
    ],
    Image: [
      {
        html: '<button class="btn btn-medium btn-info" onclick="browseImages()">Upload Image</button>' +
          '<input id="uploadInput" onchange="uploadFile(this.files)" style="display:none" type="file" name="pic" accept="image/*">',
        tags: "picture image custom external upload sprite"
      },
      {
        url: "./images/kpU9y5M.png",
        code: 'var unicorn = new Image()\nunicorn.url = "./docs/images/unicorn.png"\nunicorn.width = 120\nunicorn.height = 80',
        tags: "unicorn sprite animal",
      },

      {
        url: "./images/SuJhyZq.png",
        code: 'var bb8 = new Image()\nbb8.url = "./docs/images/BB8.png"\nbb8.width = 150\nbb8.height = 220',
        tags: "bb8 star wars sprite",
      },

      {
        url: "./images/2lhEgxT.png",
        code: 'var sushi = new Image()\nsushi.url = "./docs/images/sushi.png"\nsushi.width = 110\nsushi.height = 80',
        tags: "sushi sprite",
      },

      {
        url: "./images/zp0zzaG.png",
        code: 'var nyanCat = new Image()\nnyanCat.url = "./docs/images/nyancat.png"\nnyanCat.width = 160\nnyanCat.height = 80',
        tags: "cat sprite rainbow animal",
      },

      {
        url: "./images/4B3ex6S.png",
        code: 'var car = new Image()\ncar.url = "./docs/images/car.png"\ncar.width = 250\ncar.height = 80',
        tags: "car sprite",
      },

      {
        url: "./images/Q4zxvEN.png",
        code: 'var pikachu = new Image()\npikachu.url = "./docs/images/pikachu.png"\npikachu.width = 120\npikachu.height = 100',
        tags: "pikachu sprite animal",
      },

      {
        url: "./images/G7PpFgz.png",
        code: 'var taco = new Image()\ntaco.url = "./docs/images/taco.png"\ntaco.width = 300\ntaco.height = 170',
        tags: "taco sprite food",
      },

      {
        url: "./images/ajkO60k.png",
        code: 'var iceCream = new Image()\niceCream.url = "./docs/images/icecream.png"\niceCream.width = 130\niceCream.height = 170',
        tags: "ice cream sprite food",
      },

      {
        url: "./images/mZnRmHr.png",
        code: 'var minecraft = new Image()\nminecraft.url = "./docs/images/minecraft.png"\nminecraft.width = 120\nminecraft.height = 100',
        tags: "minecraft sprite person",
      },

      {
        url: "./images/614de0J.jpg",
        code: 'var mario = new Image()\nmario.url = "./docs/images/mario.png"\nmario.width = 150\nmario.height = 200',
        tags: "mario sprite person",
      },

      {
        url: "./images/0ioLJsk.jpg",
        code: 'var cupcake = new Image()\ncupcake.url = "./docs/images/cupcake.png"\ncupcake.width = 170\ncupcake.height = 170',
        tags: "cupcake sprite food",
      },

      {
        url: "./images/FArFDtL.png",
        code: 'var snitch = new Image()\nsnitch.url = "./docs/images/snitch.png"\nsnitch.width = 250\nsnitch.height = 150',
        tags: "snitch harry potter sprite",
      },

      {
        url: "./images/Gf0MwWP.png",
        code: 'var bird = new Image()\nbird.url = "./docs/images/bird.png"\nbird.width = 120\nbird.height = 80',
        tags: "flappy bird sprite animal",
      },

      {
        url: "./images/SepKsyn.png",
        code: 'var puppy = new Image()\npuppy.url = "./docs/images/puppy.png"\npuppy.width = 150\npuppy.height = 210',
        tags: "puppy dog animal sprite",
      },

      {
        url: "./images/fnKpvEY.png",
        code: 'var pusheen = new Image()\npusheen.url = "./docs/images/pusheen.png"\npusheen.width = 120\npusheen.height = 80',
        tags: "pusheen cat animal sprite",
      },

      {
        url: "./images/GfYgZJo.png",
        code: 'var spiderman = new Image()\nspiderman.url = "./docs/images/spiderman.png"\nspiderman.width = 150\nspiderman.height = 170',
        tags: "spiderman person sprite",
      },

      {
        url: "./images/50LlixQ.png",
        code: 'var apple = new Image()\napple.url = "./docs/images/apple.png"\napple.width = 150\napple.height = 170',
        tags: "apple food sprite",
      },

      {
        url: "./images/B4kqEPt.png",
        code: 'var spaceShip = new Image()\nspaceShip.url = "./docs/images/space_ship.png"\nspaceShip.width = 300\nspaceShip.height = 170',
        tags: "space ship sprite",
      },

      {
        url: "./images/9EkQfhM.png",
        code: 'var coolEmoji = new Image()\ncoolEmoji.url = "./docs/images/emoji-glasses.png"\ncoolEmoji.width = 120\ncoolEmoji.height = 120',
        tags: "glasses emoji sprite",
      },

      {
        url: "./images/9BTkkuc.png",
        code: 'var emoji = new Image()\nemoji.url = "./docs/images/emoji.png"\nemoji.width = 120\nemoji.height = 120',
        tags: "emoji heart eyes sprite",
      },

      {
        url: "./images/rGnUiWC.png",
        code: 'var sadEmoji = new Image()\nsadEmoji.url = "./docs/images/emojilaugh.png"\nsadEmoji.width = 120\nsadEmoji.height = 120',
        tags: "sad laugh emoji sprite",
      },

      {
        url: "./images/B9v5lZJ.png",
        code: 'var partyEmoji = new Image()\npartyEmoji.url = "./docs/images/emoji-party.png"\npartyEmoji.width = 120\npartyEmoji.height = 120',
        tags: "party hat emoji sprite",
      },

      {
        url: "./images/ZU8UBCM.png",
        code: 'var puppyEmoji = new Image()\npuppyEmoji.url = "./docs/images/emojipuppy.png"\npuppyEmoji.width = 120\npuppyEmoji.height = 120',
        tags: "dog puppy animal emoji sprite",
      },

      {
        url: "./images/zzNfW5S.png",
        code: 'var sillyEmoji = new Image()\nsillyEmoji.url = "./docs/images/emojieyes.jpg"\nsillyEmoji.width = 120\nsillyEmoji.height = 120',
        tags: "silly tongue emoji sprite",
      },

      {
        url: "./images/8rBZ8cu.png",
        code: 'var dragon = new Image()\ndragon.url = "./docs/images/dragon.png"\ndragon.width = 300\ndragon.height = 170',
        tags: "dragon animal sprite",
      },

      {
        url: "./images/tt5zoZq.png",
        code: 'var elephant = new Image()\nelephant.url = "./docs/images/elephant.png"\nelephant.width = 200\nelephant.height = 170',
        tags: "elephant animal sprite",
      },

      {
        url: "./images/uvKjnQI.png",
        code: 'var soccer = new Image()\nsoccer.url = "./docs/images/soccer.png"\nsoccer.width = 180\nsoccer.height = 200',
        tags: "soccer ball sprite",
      },
      {
        url: "./images/rocket.png",
        code: 'var rocket = new Image()\nrocket.url = "./docs/images/rocket.png"\nrocket.width = 120\nrocket.height = 60',
        tags: "rocket ship sprite",
      },
      {
        url: "./images/crab.png",
        code: 'var crab = new Image()\ncrab.url = "./docs/images/crab.png"\ncrab.width = 150\ncrab.height = 100',
        tags: "crab animal sprite",
      },
      {
        url: "./images/fish.png",
        code: 'var fish = new Image()\nfish.url = "./docs/images/fish.png"\nfish.width = 70\nfish.height = 30',
        tags: "fish animal sprite",
      },
      {
        url: "./images/bottomPipe.png",
        code: 'var bottomPipe = new Image()\nbottomPipe.url = "./docs/images/bottomPipe.png"\nbottomPipe.width = 100\nbottomPipe.height = 500',
        tags: "bottom pipe flappy bird sprite",
      },
      {
        url: "./images/topPipe.png",
        code: 'var topPipe = new Image()\ntopPipe.url = "./docs/images/topPipe.png"\ntopPipe.width = 100\ntopPipe.height = 500',
        tags: "top pipe flappy bird sprite",
      },

      {
        url: "./images/explosion.png",
        code: 'var explosion = new Image()\nexplosion.url = "./docs/images/explosion.png"\nexplosion.width = 100\nexplosion.height = 100',
        tags: "explosion sprite",
      },

      {
        url: "./images/boss-bomb.png",
        code: 'var bomb = new Image()\nbomb.url = "./docs/images/boss-bomb.png"\nbomb.width = 100\nbomb.height = 100',
        tags: "bomb sprite",
      },

      {
        url: "./images/boss-blaser.png",
        code: 'var bossLaser = new Image()\nbossLaser.url = "./docs/images/boss-blaser.png"\nbossLaser.width = 120\nbossLaser.height = 80',
        tags: "laser sprite",
      },

      {
        url: "./images/boss-boss.png",
        code: 'var bossShip = new Image()\nbossShip.url = "./docs/images/boss-boss.png"\nbossShip.width = 100\nbossShip.height = 100',
        tags: "boss ship sprite",
      },

      {
        url: "./images/boss-laser.png",
        code: 'var laser2 = new Image()\nlaser2.url = "./docs/images/boss-laser.png"\nlaser2.width = 100\nlaser2.height = 100',
        tags: "laser sprite",
      },

      {
        url: "./images/boss-ship.png",
        code: 'var bossShip2 = new Image()\nbossShip2.url = "./docs/images/boss-ship.png"\nbossShip2.width = 100\nbossShip2.height = 100',
        tags: "ship sprite",
      },

      {
        url: "./images/boss-warning.jpg",
        code: 'var warning = new Image()\nwarning.url = "./docs/images/boss-warning.jpg"\nwarning.width = 100\nwarning.height = 80',
        tags: "warning sprite",
      },

      {
        url: "./images/bubbles-bowl.png",
        code: 'var candyBowl = new Image()\ncandyBowl.url = "./docs/images/bubbles-bowl.png"\ncandyBowl.width = 100\ncandyBowl.height = 100',
        tags: "candy bowl sprite",
      },

      {
        url: "./images/bubbles-candy.png",
        code: 'var candy = new Image()\ncandy.url = "./docs/images/bubbles-candy.png"\ncandy.width = 100\ncandy.height = 60',
        tags: "candy sprite",
      },

      {
        url: "./images/bubbles-girl.png",
        code: 'var girl = new Image()\ngirl.url = "./docs/images/bubbles-girl.png"\ngirl.width = 70\ngirl.height = 100',
        tags: "girl sprite",
      },

      {
        url: "./images/bubbles-wand.png",
        code: 'var bubbleWand = new Image()\nbubbleWand.url = "./docs/images/bubbles-wand.png"\nbubbleWand.width = 70\nbubbleWand.height = 100',
        tags: "wand sprite",
      },

      {
        url: "./images/candyland-mint.png",
        code: 'var mint = new Image()\nmint.url = "./docs/images/candyland-mint.png"\nmint.width = 100\nmint.height = 100',
        tags: "mint food sprite",
      },

      {
        url: "./images/candyland-obstacle.png",
        code: 'var lollipop = new Image()\nlollipop.url = "./docs/images/candyland-obstacle.png"\nlollipop.width = 100\nlollipop.height = 100',
        tags: "lollipop food sprite",
      },

      {
        url: "./images/fly-fly.png",
        code: 'var fly = new Image()\nfly.url = "./docs/images/fly-fly.png"\nfly.width = 100\nfly.height = 100',
        tags: "fly animal sprite",
      },

      {
        url: "./images/fly-frog.png",
        code: 'var frog = new Image()\nfrog.url = "./docs/images/fly-frog.png"\nfrog.width = 120\nfrog.height = 90',
        tags: "frog animal sprite",
      },

      {
        url: "./images/fly-lilypad.png",
        code: 'var lilypad = new Image()\nlilypad.url = "./docs/images/fly-lilypad.png"\nlilypad.width = 100\nlilypad.height = 85',
        tags: "lilypad sprite",
      },

      {
        url: "./images/magic-dove.jpg",
        code: 'var dove = new Image()\ndove.url = "./docs/images/magic-dove.jpg"\ndove.width = 100\ndove.height = 105',
        tags: "dove animal sprite",
      },

      {
        url: "./images/magic-hat.png",
        code: 'var hat = new Image()\nhat.url = "./docs/images/magic-hat.png"\nhat.width = 100\nhat.height = 90',
        tags: "hat clothing sprite",
      },

      {
        url: "./images/picnic-basket.png",
        code: 'var picnicBasket = new Image()\npicnicBasket.url = "./docs/images/picnic-basket.png"\npicnicBasket.width = 110\npicnicBasket.height = 80',
        tags: "picnic basket sprite",
      },

      {
        url: "./images/picnic-cheese.png",
        code: 'var cheese = new Image()\ncheese.url = "./docs/images/picnic-cheese.png"\ncheese.width = 100\ncheese.height = 60',
        tags: "cheese food sprite",
      },

      {
        url: "./images/picnic-eat.png",
        code: 'var picnic = new Image()\npicnic.url = "./docs/images/picnic-eat.png"\npicnic.width = 110\npicnic.height = 110',
        tags: "picnic people sprite",
      },

      {
        url: "./images/picnic-milk.png",
        code: 'var milk = new Image()\nmilk.url = "./docs/images/picnic-milk.png"\nmilk.width = 100\nmilk.height = 100',
        tags: "picnic milk food sprite",
      },

      {
        url: "./images/picnic-sandwich.png",
        code: 'var sandwich = new Image()\nsandwich.url = "./docs/images/picnic-sandwich.png"\nsandwich.width = 100\nsandwich.height = 100',
        tags: "sandwich food sprite",
      },

      {
        url: "./images/picnic-watermelon.png",
        code: 'var watermelon = new Image()\nwatermelon.url = "./docs/images/picnic-watermelon.png"\nwatermelon.width = 100\nwatermelon.height = 100',
        tags: "watermelon food sprite",
      },

      {
        url: "./images/platformer-boss.png",
        code: 'var boss1 = new Image()\nboss1.url = "./docs/images/platformer-boss.png"\nboss1.width = 90\nboss1.height = 90',
        tags: "platformer boss animal sprite",
      },

      {
        url: "./images/platformer-boss2.png",
        code: 'var boss2 = new Image()\nboss2.url = "./docs/images/platformer-boss.png"\nboss2.width = 100\nboss2.height = 100',
        tags: "platformer boss animal sprite",
      },

      {
        url: "./images/platformer-enemy.png",
        code: 'var enemy = new Image()\nenemy.url = "./docs/images/platformer-enemy.png"\nenemy.width = 100\nenemy.height = 100',
        tags: "platformer boss animal sprite",
      },

      {
        url: "./images/platformer-enemy2.png",
        code: 'var enemy2 = new Image()\nenemy2.url = "./docs/images/platformer-enemy2.png"\nenemy2.width = 100\nenemy2.height = 100',
        tags: "platformer boss animal sprite",
      },

      {
        url: "./images/platformer-game-over.png",
        code: 'var gameOver = new Image()\ngameOver.url = "./docs/images/platformer-game-over.png"\ngameOver.width = 100\ngameOver.height = 90',
        tags: "game over sprite",
      },

      {
        url: "./images/platformer-heart.png",
        code: 'var pixelHeart = new Image()\npixelHeart.url = "./docs/images/platformer-heart.png"\npixelHeart.width = 100\npixelHeart.height = 100',
        tags: "heart shape sprite",
      },

      {
        url: "./images/platformer-next-level.png",
        code: 'var nextLevel = new Image()\nnextLevel.url = "./docs/images/platformer-next-level.png"\nnextLevel.width = 130\nnextLevel.height = 120',
        tags: "next level sprite",
      },

      {
        url: "./images/platformer-player.png",
        code: 'var player = new Image()\nplayer.url = "./docs/images/platformer-player.png"\nplayer.width = 100\nplayer.height = 100',
        tags: "player sprite",
      },

      {
        url: "./images/platformer-you-win.png",
        code: 'var youWin = new Image()\nyouWin.url = "./docs/images/platformer-you-win.png"\nyouWin.width = 110\nyouWin.height = 110',
        tags: "you win sprite",
      },

      {
        url: "./images/river-canoe1.png",
        code: 'var canoe = new Image()\ncanoe.url = "./docs/images/river-canoe1.png"\ncanoe.width = 30\ncanoe.height = 130',
        tags: "canoe boat river sprite",
      },

      {
        url: "./images/river-coconut.png",
        code: 'var coconut = new Image()\ncoconut.url = "./docs/images/river-coconut.png"\ncoconut.width = 100\ncoconut.height = 100',
        tags: "coconut food sprite",
      },

      {
        url: "./images/river-gator.png",
        code: 'var gator = new Image()\ngator.url = "./docs/images/river-gator.png"\ngator.width = 130\ngator.height = 80',
        tags: "gator animal sprite",
      },

      {
        url: "./images/river-tree.png",
        code: 'var tree = new Image()\ntree.url = "./docs/images/river-tree.png"\ntree.width = 90\ntree.height = 130',
        tags: "tree sprite",
      },

      {
        url: "./images/rr-gameover.png",
        code: 'var gameOver2 = new Image()\ngameOver2.url = "./docs/images/rr-gameover.png"\ngameOver2.width = 140\ngameOver2.height = 90',
        tags: "game over sprite",
      },

      {
        url: "./images/rr-planet.png",
        code: 'var planet = new Image()\nplanet.url = "./docs/images/rr-planet.png"\nplanet.width = 100\nplanet.height = 100',
        tags: "planet sprite",
      },

      {
        url: "./images/rr-star.png",
        code: 'var star = new Image()\nstar.url = "./docs/images/rr-star.png"\nstar.width = 100\nstar.height = 100',
        tags: "star sprite",
      },

      {
        url: "./images/squidchase-fish.png",
        code: 'var fish = new Image()\nfish.url = "./docs/images/squidchase-fish.png"\nfish.width = 100\nfish.height = 115',
        tags: "fish sprite",
      },

      {
        url: "./images/squidchase-squid.png",
        code: 'var squid = new Image()\nsquid.url = "./docs/images/squidchase-squid.png"\nsquid.width = 100\nsquid.height = 115',
        tags: "squid animal sprite",
      },

      {
        url: "./images/tomato-attack-splat.png",
        code: 'var splat = new Image()\nsplat.url = "./docs/images/tomato-attack-splat.png"\nsplat.width = 110\nsplat.height = 100',
        tags: "splat sprite",
      },

      {
        url: "./images/tomato-attack-tomato.png",
        code: 'var tomato = new Image()\ntomato.url = "./docs/images/tomato-attack-tomato.png"\ntomato.width = 110\ntomato.height = 100',
        tags: "tomato food sprite",
      },

    ],
    Rectangle: [{
      description: "Create new rectangle:",
      code: 'var rectangleSprite1 = new Rectangle()\nrectangleSprite1.width = 20\nrectangleSprite1.height = 55\nrectangleSprite1.color = "pink"',
      tags: "create new rectangle"
    }, {
      description: "Set location:",
      code: "rectangleSprite1.x = 50\nrectangleSprite1.y = -100",
      tags: "rectangle location x y"
    }, {
      description: "Set color:",
      code: "rectangleSprite1.color = rgb(100, 50, 240)"
    }, {
      description: "Set width and height:",
      code: "rectangleSprite1.width = 30\nrectangleSprite1.height = 30"
    }],

    Polygon: [{
      description: "Create new polygon:",
      code: 'var polygonSprite1 = new Polygon()\npolygonSprite1.sides = 6\npolygonSprite1.length = 100\npolygonSprite1.color = "orange"',
      tags: "create new polygon gon"
    }, {
      description: "Set location:",
      code: "polygonSprite1.x = 50\npolygonSprite1.y = -100",
      tags: "polygon gon location x y"
    }, {
      description: "Set color:",
      code: "polygonSprite1.color = rgb(100, 50, 240)"
    }, {
      description: "Set sides and length: (length is the distance from the center of the polygon to the vertex)",
      code: "polygonSprite1.sides = 12\npolygonSprite1.length: 120"
    }],

    Circle: [{
      description: "Create new circle:",
      code: 'var circleSprite1 = new Circle()\ncircleSprite1.radius = 10\ncircleSprite1.color = "white"',
      tags: "create make new circle"
    }, {
      description: "Set location:",
      code: "circleSprite1.x = 50\ncircleSprite1.y = -100",
      tags: "circle location x y"
    }, {
      description: "Set color:",
      code: "circleSprite1.color = rgb(100, 50, 240)",
      tags: "circle color"
    }, {
      description: "Set size:",
      code: "circleSprite1.radius = 12",
      tags: "circle size radius"
    }],

    Oval: [{
      description: "Create new oval:",
      code: 'var ovalSprite1 = new Oval()\novalSprite1.width = 20\novalSprite1.height = 55\novalSprite1.color = "green"',
      tags: "create new oval ellipse"
    }, {
      description: "Set location:",
      code: "ovalSprite1.x = 50\novalSprite1.y = -100",
      tags: "oval ellipse location x y"
    }, {
      description: "Set color:",
      code: "ovalSprite1.color = rgb(100, 50, 240)"
    }, {
      description: "Set width and height:",
      code: "ovalSprite1.width = 30\novalSprite1.height = 30"
    }],
    Line: [{
      description: "Create new line:",
      code: 'var lineSprite1 = new Line()\nlineSprite1.color = "pink"\nlineSprite1.width = 10\nlineSprite1.x = -100\nlineSprite1.y = 100\nlineSprite1.x1 = 10\nlineSprite1.y1 = 20'
    }, {
      description: "Set starting point:",
      code: "lineSprite1.x = 50\nlineSprite1.y = -100"
    }, {
      description: "Set ending point:",
      code: "lineSprite1.x1 = -50\nlineSprite1.y1 = 100"
    }, {
      description: "Set line width:",
      code: "lineSprite1.width = 10"
    }, {
      description: "Set color:",
      code: "lineSprite1.color = rgb(100, 50, 240)"
    }],
  },
  Motion: [{
    use: [{ href: "motion_movesteps", blockHeight: 56 }],
    code: "sprite1.move(10)",
    tags: "motion move forward glide animate steps"
  }, {
    use: [{ href: "motion_turnright", blockHeight: 56 }],
    code: "sprite1.turnRight(15)",
    tags: "turn angle point direction orientation right motion"
  }, {
    use: [{ href: "motion_turnleft", blockHeight: 56 }],
    code: "sprite1.turnLeft(15)",
    tags: "turn angle point direction orientation left motion"
  },
  {
    use: [{ href: "motion_pointindirection", blockHeight: 56 }],
    code: "sprite1.angle = LEFT  \nsprite1.angle = RIGHT \nsprite1.angle = UP \nsprite1.angle = DOWN \nsprite1.angle = 45",
    tags: "angle turn point direction right left up down orientation motion"
  }, {
    use: [{ href: "motion_pointtowards", blockHeight: 56 }],
    code: "sprite1.pointTowards(sprite2)",
    tags: "turn point direction angle sprite character towards mouse motion"
  }, {
    use: [{ href: "motion_pointtowards", blockHeight: 56 }],
    code: "sprite1.pointTowards(mouseX, mouseY)",
    tags: "motion turn point direction towards angle sprite character mouse"
  },
  {
    use: [{ href: "motion_gotoxy", blockHeight: 56 }],
    code: "sprite1.x = 0 \nsprite1.y = 0",
    tags: "teleport move location set x y go motion"
  }, {
    use: [{ href: "motion_goto", blockHeight: 56 }],
    code: "sprite1.x = randomX() \nsprite1.y = randomY()",
    tags: "teleport move location set x y random position go motion"
  }, {
    use: [{ href: "motion_goto", blockHeight: 56 }],
    code: "sprite1.x = mouseX\nsprite1.y = mouseY",
    tags: "teleport location move mouse go pointer motion"
  }, {
    use: [{ href: "motion_goto", blockHeight: 56 }],
    code: "sprite1.x = sprite2.x \nsprite1.y = sprite2.y",
    tags: "teleport location other move go motion"
  },
  {
    use: [{ href: "motion_glidesecstoxy", blockHeight: 56 }],
    description: "This block does not exist in WoofJS, but you can use other Motion blocks to achieve this. For example:",
    code: "sprite1.pointTowards(166, -136)\nrepeat(100, () => {\n sprite1.move(1)\n})",
    tags: "glide go move motion"
  },
  {
    use: [{ href: "motion_changexby", blockHeight: 56 }],
    code: 'sprite1.x += 10',
    tags: "increase decrease change x move right left motion"
  },
  {
    use: [{ href: "motion_setx", blockHeight: 56 }],
    code: 'sprite1.x = 0',
    tags: "set x motion"
  },
  {
    use: [{ href: "motion_changeyby", blockHeight: 56 }],
    code: 'sprite1.y += -10',
    tags: "increase decrease change y move up down motion"
  }, {
    use: [{ href: "motion_sety", blockHeight: 56 }],
    code: 'sprite1.y = 0',
    tags: "set y motion"
  },
  {
    use: [{ href: "motion_ifonedgebounce", blockHeight: 56 }],
    description: "This block does not exist in WoofJS, but there are other ways you can do the same thing. Here is an example:",
    code: 'if(sprite1.x > maxX) {sprite1.turnRight(180)}',
    tags: "rotate bounce turn edge on motion"
  },
  {
    use: [{ href: "motion_setrotationstyle", blockHeight: 56 }],
    code: 'sprite1.setRotationStyle("ROTATE LEFT RIGHT")',
    tags: "rotation style turn flip set rotate left right motion"
  }, {
    use: [{ href: "motion_setrotationstyle", blockHeight: 56 }],
    code: 'sprite1.setRotationStyle("ROTATE")',
    tags: "rotation style turn all around flip motion"
  }, {
    use: [{ href: "motion_setrotationstyle", blockHeight: 56 }],
    code: 'sprite1.setRotationStyle("NO ROTATE")',
    tags: "rotation style no don\'t turn flip motion"
  },
  {
    use: [{ href: "xposition", blockHeight: 40 }],
    code: "sprite1.x",
    tags: "x position coordinate motion"
  },
  {
    use: [{ href: "yposition", blockHeight: 40 }],
    code: "sprite1.y",
    tags: "y position coordinate motion"
  },
  {
    use: [{ href: "direction", blockHeight: 40 }],
    code: "sprite1.angle",
    tags: "direction angle motion"
  }
  ],
  Events: [
  {
    use: [{ href: "event_whenflagclicked", blockHeight: 80 }],
    description: "Note: Unlike in Scratch, using ready() is recommended but not always required.",
    code: "ready(() => {\n  \/* do something here */\n})",
    tags: "on onclick when green flag clicked page loaded event start ready"
  },
  {
    use: [{ href: "event_whenkeypressed", blockHeight: 80 }],
    code: "onKeyDown(() => {\n  \/* do something here */\n})",
    tags: "on when key keyboard press down any event"
  }, {
    use: [{ href: "event_whenkeypressed", blockHeight: 80 }],
    code: "onKeyDown(() => {\n if (keysDown.includes('A')) {\n   \/* do something here */\n  }\n})",
    tags: "on when key keyboard press down event"
  }, {
    use: [{ href: "event_whenkeypressed", blockHeight: 80 }],
    code: "onKeyDown(() => {\n if (keysDown.includes('UP')) {\n   \/* do something here */\n  }\n})",
    tags: "on when key up keyboard press down event"
  },
  {
    use: [{ href: "event_whenstageclicked", blockHeight: 80 }],
    code: "onMouseDown(() => {\n  \/* do something here */\n})",
    tags: "on onclick when click mouse down event stage event"
  },
  {
    description: "On mouse up",
    code: "onMouseUp(() => {\n  \/* do something here */\n})",
    tags: "on when click mouse up event"
  }, {
    description: "On mouse move",
    code: "onMouseMove(() => {\n  \/* do something here */\n})",
    tags: "on when mouse move event"
  },
  {
    use: [{ href: "event_whenthisspriteclicked", blockHeight: 80 }],
    code: "sprite1.onMouseDown(() => {\n  \/* do something here */\n})",
    tags: "on onclick sprite when click mouse down event"
  }, {
    description: "On mouse up",
    code: "sprite1.onMouseUp(() => {\n  \/* do something here */\n})",
    tags: "on when click mouse up sprite event"
  },
  {
    use: [{ href: "event_whenbackdropswitchesto", blockHeight: 80 }],
    description: "This block does not exist in WoofJS.",
    tags: "backdrop switches when event"
  },
  {
    use: [{ href: "event_whengreaterthan", blockHeight: 80 }],
    description: "This block does not exist in WoofJS.",
    tags: "loudness when event"
  },
  {
    use: [{ href: "event_whenbroadcastreceived", blockHeight: 80 }, { href: "event_broadcast", blockHeight: 56 }, { href: "event_broadcastandwait", blockHeight: 56 }],
    description: "These blocks do not exist in WoofJS. Scratch is first-person programming so if you want one sprite to communicate with another, you need to send messages. However, WoofJS is third-person so you can coordinate things between sprites without them talking to each other. You can use variables to hold \"messages\".",
    tags: "broadcast receive event message wait"
  }
  ],
  Looks: [{
    description: "Create a color with red, green and blue values between 0 and 255",
    tags: "looks color rgb colour red blue green yellow orange pink purple magenta brown black",
    code: 'rgb(255, 100, 0)'
  },
  {
    use: [{ href: "looks_say", blockHeight: 56 }, { href: "looks_sayforsecs", blockHeight: 56 }, { href: "looks_think", blockHeight: 56 }, { href: "looks_thinkforsecs", blockHeight: 56 }],
    description: "These blocks do not exist in WoofJS, but you can use text for a similar effect. Here is an example:",
    code: '// First create your speech bubble image sprite\nvar speechBubble = new Image()\nspeechBubble.url = "./docs/images/speechBubble.png"\nspeechBubble.width = 150\nspeechBubble.height = 75\n// Then create text\nvar text = new Text()\ntext.text = () => "Hello!"\ntext.size = 25\nforever(() => {\n // Align the speech bubble with your sprite\n // uncomment the following lines and change sprite1 to the name of your sprite:\n // speechBubble.x = sprite1.x + (speechBubble.width / 2) + (sprite1.width / 2)\n // speechBubble.y = sprite1.y + (speechBubble.height / 2) + (sprite1.height / 2)\n // Keep the text aligned with the bubble \n text.x = speechBubble.x\n text.y = speechBubble.y + 10\n})',
    tags: "looks say think hello seconds"
  },
  {
    use: [{ href: "looks_show", blockHeight: 56 }],
    code: "sprite1.show()",
    tags: "show appear looks"
  },
  {
    url: ["looks_hide"],
    code: "sprite1.hide()",
    tags: "looks hide disappear"
  },
  {
    code: "if(sprite1.showing){\n /* then do stuff here */\n}",
    html: "Use the <code>.showing</code> attribute to check if your sprite is showing.",
    tags: "showing hiding if when"
  },
  {
    use: [{ href: "looks_costume", blockHeight: 56 }],
    code: "imageSprite1.setImageURL('./images/SMJjVCL.png')",
    tags: "costume image url picture switch looks"
  }, {
    description: "You can only setImageURL() for Images.\nChange the color for rectangles, text, lines and circles:",
    tags: "change color looks"
  }, {
    code: 'rectangleSprite1.color = "purple"',
    tags: "change color looks rectangle"
  }, {
    code: 'textSprite1.color = "rgb(10, 150, 30)"',
    tags: "change color looks text"
  }, {
    code: 'lineSprite1.color = "#ff20ff"',
    tags: "change color line looks"
  }, {
    code: 'circleSprite1.color = "green"',
    tags: "change color circle looks"
  },
  {
    url: ["looks_switchbackdropto"],
    description: "Set the backdrop to an image URL:",
    code: 'setBackdropURL("./images/RkP7fcR.jpg")',
    tags: "background backdrop picture image URL switch looks"
  }, {
    description: "Set the backdrop to a color:",
    code: 'setBackdropColor("blue")',
    tags: "backdrop background color looks set"
  }, {
    description: "Set a backdrop image so that it resizes to fill the screen without stretching or compressing",
    code: 'setBackdropStyle("cover")',
    tags: "backdrop background set picture cover style looks"
  }, {
    description: "Set the backdrop image's width and height via pixel values.",
    code: 'setBackdropStyle("200px 300px")',
    tags: "backdrop background picture pixel size set style width looks"
  }, {
    description: "Set the backdrop image to percentages of the screen's width and height. (The default is 100% 100%.)",
    code: 'setBackdropStyle("100% 100%")',
    tags: "backdrop background picture default set style percent width height looks"
  }, {
    description: "Set the backdrop image to repeat in the x-direction and not the y-direction. (This is useful if you set the backdrop style to pixels.)",
    code: 'setBackdropRepeat("repeat-x")',
    tags: "backdrop background picture repeat style x looks set"
  }, {
    description: "Set the backdrop image to repeat in the y-direction and not the x-direction. (This is useful if you set the backdrop style to pixels.)",
    code: 'setBackdropRepeat("repeat-y")',
    tags: "backdrop background picture repeat style y looks"
  }, {
    description: "Set the backdrop image to not repeat in either direction. (no-repeat is the default.)",
    code: 'setBackdropRepeat("no-repeat")',
    tags: "backdrop background picture no repeat style looks"
  },
  {
    use: [{ href: "looks_changeeffectby", blockHeight: 56 }],
    description: "These blocks do not exist in WoofJS, but you can change the colors of rectangle, text, lines, and circle sprites.",
    tags: "color effect clear graphic looks"
  }, {
    description: "Set the brightness percentage between 0-100 (also known as transparency or opacity)",
    use: [{ href: "looks_changeeffectby", blockHeight: 56 }],
    code: "sprite1.brightness = 50",
    tags: "brightness opacity opaqueness transparency looks"
  },
  {
    use: ["looks_setsizeto", "looks_changesizeby"],
    description: "You set and change the size in different ways for each type of sprite:",
    tags: "size width height radius looks"
  }, {
    code: 'imageSprite1.height = 20\nimageSprite1.width = 20',
    tags: "size height width length image looks"
  }, {
    code: 'rectangleSprite1.height = 20\nrectangleSprite1.width = 20',
    tags: "size height rectangle width length looks"
  }, {
    code: 'circleSprite1.radius = 20',
    tags: "size circle radius looks"
  }, {
    code: 'lineSprite1.x1 = 20\nlineSprite1.y1 = 20\nlineSprite1.width = 20',
    tags: "size line width length height looks"
  }, {
    code: 'textSprite1.size = 20',
    tags: "size font text looks"
  },, {
    use: [{ href: "looks_gotofrontback", blockHeight: 56 }],
    code: "sprite1.sendToFront()",
    tags: "layer send in front looks"
  },
  {
    use: [{ href: "looks_gotofrontback", blockHeight: 56 }],
    code: "sprite1.sendToBack()",
    tags: "layer back send behind looks"
  }],
  Control: [{
    use: [{ href: "control_wait", blockHeight: 56 }],
    code: 'after(4, "seconds", () => {\n  \/* do something here */\n})',
    description: 'There is no wait block in JavaScript. Instead, you can use after():',
    tags: "wait after seconds control"
  }, {
    code: 'every(3, "seconds", () => {\n  \/* do something here */\n})',
    description: 'If you want to wait at regular intervals, use every():',
    tags: "wait every seconds control"
  }, {
    code: 'every(() => random(1, 5), "seconds", () => {\n \/* do something here */\n})',
    description: 'If you want to wait at changing intervals, use every() with a function instead of a number.',
    tags: "wait every seconds random control"
  },
  {
    use: [{ href: "control_repeat", blockHeight: 104 }],
    code: 'repeat(10, () => {\n  \/* do stuff here */\n})',
    tags: "repeat times control"
  }, {
    description: "If you want your code to depend on how many times it's been repeated so far, you can use a variable in the `repeat()`, which counts up from 1:",
    code: 'repeat(8, timesSoFar => {\n  var poly = new Polygon()\n  \/\/ we don\'t want polygons with 1 or 2 sides\n  poly.sides = timesSoFar + 2\n  poly.length = 20\n  poly.color = "red"\n  poly.x = minX + (timesSoFar * 50)\n})',
    tags: "repeat times control for index"
  }, {
    description: "When you use `repeat()`, your code doesn't repeat as fast as the computer can run it.\
      Instead, we slow it down, which makes things like animation and motion work well. But, if you want your code to repeat instantly,\
      as fast as the computer can do it, you can combine the <code>range()</code> function with the `forEach()` function:\
      \n\nExample: Repeat your code instantly 10 times, starting `counter` at 0 and going up by one each repetition, stopping before it gets to 10:",
    code: "range(0, 10).forEach(counter => {\n  \/* something to repeat */\n})",
    tags: "repeat range array forEach control for index"
  }, {
    description: "If you are familiar with `for` loops, you might realize that this does the same thing.\
      We recommend using `range().forEach()` instead of `for`"
  }, {
    use: [{ href: "forever", blockHeight: 104 }],
    code: 'forever(() => {\n  \/* do stuff here */\n})',
    tags: 'forever loop repeat control'
  },
  {
    use: [{ href: "control_if", blockHeight: 112 }],
    code: 'if(\/* something is */ true) {\n  \/* then do stuff here */\n}',
    tags: 'if then when condition control'
  }, {
    use: [{ href: "control_if_else", blockHeight: 168 }],
    code: 'if(\/* something is */ true) {\n  \/* then do stuff here */\n} else {\n  \/* otherwise do other stuff here */ \n}',
    tags: 'if else when condition control'
  }, {
    use: [{ href: "repeat_until", blockHeight: 112 }],
    code: 'repeatUntil(() => \/* something is */ true, () => {\n  \/* something to repeat */\n})',
    tags: 'repeat until control'
  }, {
    use: [{ href: "wait_until", blockHeight: 56 }],
    code: 'repeatUntil(() => \/* something is */ true, () => {}, () => {\n  \/* something to do after condition is true, once */\n})',
    tags: "wait until repeat control",
    description: 'There is no wait-until in JavaScript. You can simulate a wait-until block by specifying a third function to a repeatUntil.'
  }, {
    description: "Similarly to repeat(), you can ask repeatUntil() how many times it has been repeated:",
    code: 'repeatUntil(() => \/* something is */ true, timesRepeatedSoFar => {\n  sprite1.move(timesRepeatedSoFar)\n}, totalTimesRepeated => {\n  sprite1.turnRight(totalTimesRepeated)\n})',
    tags: 'repeat until control for index'
  }, {
    code: 'when(() => \/* something is */ true, () => {\n  \/* do stuff here */\n})',
    tags: "forever if when control",
    description: 'when() is a short-hand for a forever-if statement:'
  },
  {
    use: [{ href: "control_stop", blockHeight: 56 }],
    code: 'freeze()',
    description: 'Freeze the screen. You can reanimate the screen with defrost()',
    tags: 'freeze stop all frost control'
  }, {
    description: 'Un-freezes the screen. Use this after you use freeze()',
    code: 'defrost()',
    tags: 'freeze stop start defrost control'
  },
  {
    use: ["control_create_clone_of", "control_start_as_clone", "control_delete_this_clone"],
    description: "Cloning in WoofJS is more difficult but more powerful than it is in scratch. We recommend starting with the Cloning Tutorial. You can also find it in the Tutorials tab.",
    code: '// create a list to store all of the clones\nvar clones = []\nevery(4, "seconds", () => {\n  // create a clone every 4 seconds\n  var clone = new Circle()\n  clone.radius = 10\n  clone.color = "pink"\n  clone.x = randomX()\n  clone.y = randomY()\n  // add each clone to the list\n  clones.push(clone)\n})\n\nforever(() => {\n  // forever, for each clone in clones\n  clones.forEach(clone => {\n    // move it to the right\n    clone.x++\n    if (clone.x > maxX) {\n      // delete it if it goes off the screen\n      clone.delete()\n      // remove it from the list\n      clones.remove(clone)\n    }\n  })\n})',
    tags: 'clone copy control'
  }, {
    code: 'sprite1.delete()',
    description: "Delete an object. (Note: This only deletes it from the screen. To truly delete it, you may need to remove it from any arrays it is in.)",
    tags: ' delete remove destroy clones copy control'
  }, {
    code: '// after a mousedown, you won\'t be able to trigger this event again for 1000 milliseconds\nonMouseDown(throttle(() => score++, 1000))',
    description: 'Only allow something to happen once every X miliseconds:',
    tags: "debounce throttle control"
  },
  ],
  Sound: [{
    sound: "./sounds/mario-jump.wav",
    url: "./images/playmario.png",
    code: 'var mario = new Sound()\nmario.url = "./docs/sounds/mario-jump.wav"\nmario.loop = false\nmario.speed = "normal"\nmario.volume = "normal"\n\nmario.startPlaying()',
    tags: "music play sounds audio"
  }, {
    sound: "./sounds/asteroids-saucer.wav",
    url: "./images/asteroids-saucer.png",
    code: 'var saucer = new Sound()\nsaucer.url = "./docs/sounds/asteroids-saucer.wav"\nsaucer.loop = false\nsaucer.speed = "normal"\nsaucer.volume = "normal"\n\nsaucer.startPlaying()',
    tags: "music play sounds audio"
  }, {
    sound: "./sounds/alien.mp3",
    url: "./images/playalien.png",
    code: 'var alien = new Sound()\nalien.url = "./docs/sounds/alien.mp3"\nalien.loop = false\nalien.speed = "normal"\nalien.volume = "normal"\n\nalien.startPlaying()',
    tags: "music play sounds audio"
  }, {
    sound: "./sounds/applause.mp3",
    url: "./images/playapplause.png",
    code: 'var applause = new Sound()\napplause.url = "./docs/sounds/applause.mp3"\napplause.loop = false\napplause.speed = "normal"\napplause.volume = "normal"\n\napplause.startPlaying()',
    tags: "applause music play sounds audio"
  }, {
    sound: "./sounds/bark.mp3",
    url: "./images/playbark.png",
    code: 'var bark = new Sound()\nbark.url = "./docs/sounds/bark.mp3"\nbark.loop = false\nbark.speed = "normal"\nbark.volume = "normal"\n\nbark.startPlaying()',
    tags: "bark dog music play sounds audio"
  }, {
    sound: "./sounds/switch.mp3",
    url: "./images/playswitch.png",
    code: 'var switchSound = new Sound()\nswitchSound.url = "./docs/sounds/switch.mp3"\nswitchSound.loop = false\nswitchSound.speed = "normal"\nswitchSound.volume = "normal"\n\nswitchSound.startPlaying()',
    tags: "switch music play sounds audio"
  }, {
    sound: "./sounds/mario-coin.wav",
    url: "./images/playlevel.png",
    code: 'var levelUp = new Sound()\nlevelUp.url = "./docs/sounds/mario-coin.wav"\nlevelUp.loop = false\nlevelUp.speed = "normal"\nlevelUp.volume = "normal"\n\nlevelUp.startPlaying()',
    tags: "mario music level play sounds audio"
  }, {
    sound: "./sounds/meow.mp3",
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f4c387a6e6d4f622e706e67",
    code: 'var meow = new Sound()\nmeow.url = "./docs/sounds/meow.mp3"\nmeow.loop = false\nmeow.speed = "normal"\nmeow.volume = "normal"\n\nmeow.startPlaying()',
    tags: "meow cat music play sounds audio"
  }, {
    sound: "./sounds/text-alert.mp3",
    url: "./images/playtext.png",
    code: 'var textAlert = new Sound()\ntextAlert.url = "./docs/sounds/text-alert.mp3"\ntextAlert.loop = false\ntextAlert.speed = "normal"\ntextAlert.volume = "normal"\n\ntextAlert.startPlaying()',
    tags: "music play sounds audio text alert"
  }, {
    sound: "./sounds/fart.wav",
    url: "./images/playfart.png",
    code: 'var fart = new Sound()\nfart.url = "./docs/sounds/fart.wav"\nfart.loop = false\nfart.speed = "normal"\nfart.volume = "normal"\n\nfart.startPlaying()',
    tags: "fart music play sounds audio"
  }, {
    sound: "./sounds/river-ride.mp3",
    url: "./images/river-ride.png",
    code: 'var riverRide = new Sound()\nriverRide.url = "./docs/sounds/river-ride.mp3"\nriverRide.loop = false\nriverRide.speed = "normal"\nriverRide.volume = "normal"\n\nriverRide.startPlaying()',
    tags: "music play sounds audio"
  }, {
    sound: "./sounds/star-wars.mp3",
    url: "./images/playstarwars.png",
    code: 'var starWars = new Sound()\nstarWars.url = "./docs/sounds/star-wars.mp3"\nstarWars.loop = false\nstarWars.speed = "normal"\nstarWars.volume = "normal"\n\nstarWars.startPlaying()',
    tags: "star wards music play sounds audio"
  }, {
    sound: "./sounds/round_new.mp3",
    url: "./images/playround.png",
    code: 'var newRound = new Sound()\nnewRound.url = "./docs/sounds/round_new.mp3"\nnewRound.loop = false\nnewRound.speed = "normal"\nnewRound.volume = "normal"\n\nnewRound.startPlaying()',
    tags: "level up music play sounds audio"
  }, {
    sound: "./sounds/pop.wav",
    url: "./images/pop.png",
    code: 'var pop = new Sound()\npop.url = "./docs/sounds/pop.wav"\npop.loop = false\npop.speed = "normal"\npop.volume = "normal"\n\npop.startPlaying()',
    tags: "pop music play sounds audio"
  }, {
    sound: "./sounds/bang.wav",
    url: "./images/bang.png",
    code: 'var bang = new Sound()\nbang.url = "./docs/sounds/bang.wav"\nbang.loop = false\nbang.speed = "normal"\nbang.volume = "normal"\n\nbang.startPlaying()',
    tags: "bang music play sounds audio"
  }, {
    sound: "./sounds/shoot.wav",
    url: "./images/shoot.png",
    code: 'var shoot = new Sound()\nshoot.url = "./docs/sounds/shoot.wav"\nshoot.loop = false\nshoot.speed = "normal"\nshoot.volume = "normal"\n\nshoot.startPlaying()',
    tags: "shoot music play sounds audio"
  }, {
    description: "Loop:",
    code: 'mySound.loop = "false"mySound.loop = "true"',
    tags: "sound sounds audio loop"
  }, {
    description: "Speed: (use string or number value)",
    code: '// Slow\nmySound.speed = "slow"\nmySound.speed = 0.5\n\n// Normal\nmySound.speed = "normal"\nmySound.speed = 1\n\n// Fast\nmySound.speed = "fast"\nmySound.speed = 2',
    tags: "sound sounds audio speed"
  }, {
    url: "./images/set-volume.png",
    description: "(use string or number value between 0 and 1)",
    code: '// Mute\nmySound.volume = "mute"\nmySound.volume = 0\n\n// Low\nmySound.volume = "low"\nmySound.volume = 0.5\n\n// Normal\nmySound.volume = "normal"\nmySound.volume = 1',
    tags: "sound audio volume"
  }, {
    html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f58396b6b3679572e706e67",
    description: "Stop this sound playing.",
    code: "mario.stopPlaying()",
    tags: "pause music stop sounds audio"
  }, {
    html: "Pause this sound. If you <code>.startPlaying()</code> after this, it will resume where it was paused.",
    code: "mario.pausePlaying()",
    tags: "pause music stop sounds audio"
  }, {
    description: "The time (in seconds) that a sound is playing:",
    code: '// Get the current time of a sound\nmario.currentTime\n\n// Go back to the start of a sound\nmario.currentTime = 0',
    tags: "sound sounds music audio time current"
  }, {
    description: "The duration of a sound (in seconds):",
    code: 'mario.duration',
    tags: "sound sounds music audio time duration"
  }, {
    code: "if (mario.neverPlayed()){\n /* then do stuff here */\n}",
    html: "Use the <code>.neverPlayed()</code> function to check if your sound has been played before:",
    tags: "sound play music played audio"
  }, {
    code: "if (mario.isPlaying){\n /* then do stuff here */\n}",
    html: "Use the <code>.isPlaying</code> attribute to check if your sound is playing:",
    tags: "sound play music played pause stop audio"
  }, {
    html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>"
  }, {
    description: "These blocks do not exist in WoofJS:",
    html: "<img style='margin-top: 5px' src='./images/soundFeatures.png'>",
    tags: "drum note volume play tempo instrument beats rest audio sounds"
  }, {
    html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f7439584b4f706e2e706e67",
    code: "intitle:index.of?mp3 NAME-OF-SONG",
    description: "To get the URL of an mp3, Google search:",
    tags: "mp3 sound file audio URL"
  }],
  Sensing: [{
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f515470574f78562e706e67",
    code: "sprite1.mouseOver",
    tags: "mouse over sensing"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f794558496e4b692e706e67",
    description: "If you want to see if the center of your sprite is outside of a boundary, here are some expressions that could be helpful:",
    code: "sprite1.x > maxX\nsprite1.x < minX\nsprite1.y > maxY\nsprite1.y < minY",
    tags: "boundary touching edge off outside sensing"
  }, {
    html: "<b>Cropping images will make <code>touching()</code> more accurate.</b>",
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f733236773670632e706e67",
    code: "sprite1.touching(sprite2)",
    tags: "touching intersecting overlap sensing"
  },
  {
    html: "<b>For some sprites, <code>distanceTo()</code> will be more accurate than <code>touching()</code>.",
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f733236773670632e706e67",
    code: "sprite1.distanceTo(sprite2) < 100",
    tags: "touching sensing distance"
  },
  {
    url: "./images/touchingColor.png",
    description: "These blocks do not exist in WoofJS.",
    tags: "touching color sensing"
  },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f634959335359792e706e67",
    code: "sprite1.distanceTo(mouseX, mouseY)",
    tags: "distance sensing mouse pointer"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f7936735847544b2e706e67",
    code: "sprite1.distanceTo(sprite2)",
    tags: "distance sensing"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/ask.png",
    description: "These blocks do not exist in WoofJS, but you can achieve a similar effect by doing the following:",
    code: "var answer = prompt(\"Please enter your name\", \"\")",
    tags: "ask answer prompt input sensing"

  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f625a6e7a524b482e706e67",
    code: "keysDown.includes('SPACE')",
    tags: "key keyboard down pressed sensing"
  }, {
    description: "List of keys currently pressed:",
    code: "keysDown",
    tags: "keys keyboard pressed down sensing"
  }, {
    url: "./images/mousedown.png",
    code: "mouseDown",
    tags: "mouse down clicked pressed sensing"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f4a634b4c6631722e706e67",
    code: "mouseX",
    tags: "mouse x position sensing"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f6a3843467155742e706e67",
    code: "mouseY",
    tags: "mouse Y position sensing"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/loudnessLevel.png",
    description: "This block does not exist in WoofJS.",
    tags: "loudness sensing"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/video.png",
    description: "These blocks do not exist in WoofJS.",
    tags: "video sensing"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/scratch_timer.png",
    description: "Number of seconds since the script started. If you want whole number seconds, use Math.round(timer()).",
    code: "timer()",
    tags: "timer sensing"
  },
  {
    url: "./images/scratch_reset_timer.png",
    description: "Reset the timer to 0.",
    code: "resetTimer()",
    tags: "timer sensing"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f61664c6474384b2e706e67",
    code: "sprite1.x",
    tags: "x position sensing"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f42377644686a322e706e67",
    code: "sprite1.y",
    tags: "y position sensing"
  }, {
    description: "Previous mouse X:",
    code: "pMouseX",
    tags: "x previous mouse sensing"
  }, {
    description: "Previous mouse Y:",
    code: "pMouseY",
    tags: "y previous mouse sensing"
  }, {
    description: "Mouse X speed:",
    code: "mouseXSpeed",
    tags: "mouse speed x sensing"
  }, {
    description: "Mouse Y speed:",
    code: "mouseYSpeed",
    tags: "mouse speed y sensing"
  }, {
    description: "Right edge of the screen:",
    code: "maxX",
    tags: "edge right screen sensing maxX"
  }, {
    description: "Left edge of the screen:",
    code: "minX",
    tags: "edge left screen minX sensing"
  }, {
    description: "Top edge of the screen:",
    code: "maxY",
    tags: "edge top screen maxY sensing"
  }, {
    description: "Bottom edge of the screen:",
    code: "minY",
    tags: "edge bottom screen minY sensing"
  }, {
    description: "Width of the screen:",
    code: "width",
    tags: "width x screen sensing"
  }, {
    description: "Height of the screen:",
    code: "height",
    tags: "heigth y screen sensing"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f316b4f4852797a2e706e67",
    code: "hour()",
    tags: "hour time sensing"
  }, {
    description: "Hour in military time:",
    code: "hourMilitary()",
    tags: "hour military time sensing"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f37696e366966412e706e67",
    code: "minute()",
    tags: "minute sensing current"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f685749394354722e706e67",
    code: "second()",
    tags: "current second time sensing"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f5768735166316d2e706e67",
    code: "dayOfMonth()",
    tags: "current date day month sensing"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f674c35786b62652e706e67",
    code: "dayOfWeek()",
    tags: "current day of week time sensing"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f7735634a3561742e706e67",
    code: "month()",
    tags: "current month time sensing"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f697357785538432e706e67",
    code: "year()",
    tags: "current year time sensing"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/username.png",
    description: "This block does not exist in WoofJS.",
    tags: "username"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    description: "User is on a mobile device:",
    code: "mobile()"
  }],
  Pen: [{
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f6241636d366a482e706e67",
    code: 'clearPen()',
    tags: "pen clear draw"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/stamp.png",
    description: "This block does not exist in WoofJS.",
    tags: "pen stamp"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f5457656e5761702e706e67",
    code: 'sprite1.penDown()',
    tags: "pen down draw"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f354837696a42772e706e67",
    code: 'sprite1.penUp()',
    tags: "pen up draw"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f504c744b5663762e706e67",
    code: 'sprite1.penColor = "blue"\nsprite1.penColor = "#ff20ff"\nsprite1.penColor = "rgb(10, 100, 20)"',
    tags: "pen color set"
  },
  {
    url: "./images/penColor.png",
    description: "These blocks do not exist in WoofJS.",
    tags: "pen color change"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/penShade.png",
    description: "These blocks do not exist in WoofJS.",
    tags: "pen shade"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/changePenSize.png",
    code: "sprite1.penWidth += 1",
    tags: "pen width size"
  },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f4f7a59355a6a552e706e67",
    code: 'sprite1.penWidth = 4',
    tags: "pen width size"
  }
  ],
  Operations: [{
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f6e73446b436b742e706e67",
    code: "sprite1.x + 4",
    tags: "addition add plus operations"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f585341415449502e706e67",
    code: "sprite1.y - 10",
    tags: "minus subtraction operations"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f756a6e477045362e706e67",
    code: "sprite1.radius * 2",
    tags: "times multiply multiplication operations"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f423042476b434a2e706e67",
    code: "maxX / 2",
    tags: "divide division operations fraction"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f664148754477792e706e67",
    code: "random(1, 10)",
    tags: "random pick operations"
  }, {
    description: "Random X value on the screen between minX and maxX:",
    code: "randomX()",
    tags: "operations random x"
  }, {
    description: "Random Y value on the screen between minY and maxY:",
    code: "randomY()",
    tags: "operations random y"

  }, {
    description: "Random color:",
    code: "randomColor()",
    tags: "random color operations"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f3268716f4866682e706e67",
    code: "sprite1.x < minX",
    tags: "less than compare operations"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f715837646d77742e706e67",
    code: "sprite1.y > maxY",
    tags: "greater than compare operations"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f3766384652625a2e706e67",
    code: "timer === 0",
    tags: "equal to same as operations"
  },

  {
    description: "Less Than or Equal To:",
    code: "sprite1.y <= minY",
    tags: "less than equal operations"
  }, {
    description: "Greater Than or Equal To:",
    code: "sprite1.x >= maxX",
    tags: "greater than equal operations"
  }, {
    description: "Not Equals:",
    code: "timer !== 0",
    tags: "not equals operations"
  }, {
    description: "Between Two Numbers :",
    code: "sprite1.x.between(minX, maxX)",
    tags: "between two numbers operations"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f5559684d3574702e706e67",
    code: "mouseDown && sprite1.mouseOver",
    tags: "and operations"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f505433496c6e302e706e67",
    code: "sprite1.mouseOver || sprite2.mouseOver",
    tags: "or operations"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f66487253395a4b2e706e67",
    code: '!(mouseDown)',
    tags: "not operations"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f5671674c32696f2e706e67",
    code: '"hello " + "world"',
    tags: "combine string add append join operations"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f684952693678512e706e67",
    code: '"world".substring(0,1)',
    tags: "cut string operations substring letter"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f717354526143782e706e67",
    code: '"world".length',
    tags: "operations length"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f4e466f59396c382e706e67",
    code: "sprite1.x % 2",
    tags: "reminder modulus mod operations"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f746b76796a52542e706e67",
    code: "Math.round(5.763)",
    tags: 'round operations math'
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/sqrt.png",
    code: "sqrt(9)",
    tags: "sqrt root square operations"
  },
  {
    url: "./images/abs.png",
    code: "abs(-9)",
    tags: "abs absolute value operations"
  },
  {
    url: "./images/floor.png",
    code: "floor(9.8)",
    tags: "floor round operations"
  },
  {
    url: "./images/ceiling.png",
    code: "ceiling(9.8)",
    tags: "ceiling round operations"
  },
  {
    url: "./images/sin.png",
    code: "sin(90)",
    description: "This function takes an input in degrees.",
    tags: "sin sine degrees operations"
  },
  {
    url: "./images/cos.png",
    code: "cos(90)",
    description: "This function takes an input in degrees.",
    tags: "cos cosine degrees operations"
  },
  {
    url: "./images/tan.png",
    code: "tan(90)",
    description: "This function takes an input in degrees.",
    tags: "tan tangent degrees operations"
  },
  {
    url: "./images/asin.png",
    code: "asin(1)",
    description: "This function takes an input in degrees.",
    tags: "asin arcsin inverse degrees operations"
  },
  {
    url: "./images/acos.png",
    code: "acos(0)",
    description: "This function takes an input in degrees.",
    tags: "acos arccos inverse degrees operations"
  },
  {
    url: "./images/atan.png",
    code: "atan(1)",
    description: "This function takes an input in degrees.",
    tags: "atan arctan inverse degrees operations"
  },
  {
    url: "./images/ln.png",
    code: "ln(4)",
    tags: "ln natural log operations"
  },
  {
    url: "./images/log.png",
    code: "log(100)",
    description: "This function is log base 10.",
    tags: "log logarithm operations"
  },
  {
    url: "./images/e.png",
    code: "pow(Math.E,1)",
    tags: "e to the power operations"
  },
  {
    url: "./images/10.png",
    code: "pow(10,2)",
    tags: "10 to the power operations"
  },
  ],
  Data: [{
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f656963593537492e706e67",
    code: "var variable1",
    tags: "variable make create data"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f4859415458584c2e706e67",
    code: "variable1 = 0",
    tags: "variable set data equals"
  }, {
    description: "You can combine creating/naming a variable with setting it:",
    code: "var variable1 = 0",
    tags: "variable data set equals create"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f704b4e46794d772e706e67",
    code: "variable1 += 1",
    tags: "increase add plus change by data change decrease"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f4447323649634e2e706e67",
    code: 'var variableTextSprite = new Text()\nvariableTextSprite.text = () => "variable1: " + variable1\nvariableTextSprite.x = 0\nvariableTextSprite.y = 0\nvariableTextSprite.size = 30\n',
    description: '"Showing a variable" works by giving a Text Sprite a function instead of a "string in quotes" as its text attribute. The Text Sprite constantly reevaluates the function which keeps the value on the screen in sync with the value of the variable.',
    tags: "show variable text data"
  },
  { html: "<hr style=\"height:7px;border:none;color:#e0e0e0;background-color:#e0e0e0;\"/>" },
  {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f7366536d6f44542e706e67",
    code: "var array1 = []",
    tags: "array list make data"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f304b306e5144332e706e67",
    code: "array1.push('thing')",
    description: "You can add anything to an array in JavaScript, including numbers, strings, but even Sprites, functions, and other arrays.",
    tags: "add array list push data"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f516754647978652e706e67",
    code: "array1.length",
    tags: "array list length size data"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f6a587479364c542e706e67",
    code: "array1[0]",
    tags: "array list get item data element"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f6a6170377166522e706e67",
    code: "array1.remove(thing)",
    tags: "array list remove delete data",
    description: "Note: this only removes things from a list. It doesn't delete them from the screen (use sprite1.delete() for that)."
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f49625a4846706d2e706e67",
    code: "array1.includes(thing)",
    tags: "contains includes array list data"
  }, {
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f5949473973746c2e706e67",
    code: 'var arrayTextSprite = new Text()\narrayTextSprite = text: () => "array1: " + array1',
    tags: "show list data"
  }, {
    description: 'Do something for each thing in an array:',
    code: "array1.forEach(thing => {\n  console.log(thing)\n})",
    tags: "for each loop list array data"
  }, {
    description: 'Check if a condition holds for at least one thing in an array:',
    code: "if (array1.some(thing => thing.over(mouseX, mouseY))) {\n  \/* do something here */\n}",
    tags: "reduce some any list array data overcheck  if condition"
  }, {
    description: 'Check if a condition holds for everything in an array:',
    code: "if(array1.every(thing => thing.touching(sprite1))) {\n  \/* do something here */\n}",
    tags: "every list arry reduce if check data"
  }, {
    description: "Find something in an array:",
    code: "var needle = array1.find(thing => thing.touching(sprite1))\nif(needle) {\n  console.log(needle)\n}",
    tags: "find search list array data"
  }, {
    html: "You can automatically generate an array with a range of numbers by using the <code>range()</code> function:"
  }, {
    html: "<strong>Example 1:</strong> Generate this array: <code>[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]</code><br>It starts at 1, ends <i>before</i> 11, and goes up by 1 every time:",
    code: "var oneToTen = range(1, 11, 1)",
    tags: "range array list numbers data"
  }, {
    html: "<strong>Example 2:</strong> Generate this array: <code>[15, 10, 5, 0, -5]</code><br>It starts at 15, ends <i>before</i> -10, and goes down by 5 every time:",
    code: "var fifteenToZero = range(15, -10, -5)",
    tags: "range array list numbers data"
  }],
  "More Blocks": [{
    url: "./images/68747470733a2f2f692e696d6775722e636f6d2f415a6c526236682e706e67",
    description: "You can create a function with a name:",
    code: "var namedFunction = (input1, input2) => {\n// do stuff here with input1 and input2\n}",
    tags: "block function method input more blocks"
  }, {
    description: "You can run a function by putting parentheses next to its name:",
    code: "namedFunction(1, 2)",
    tags: "run more blocks function"
  }, {
    description: "You need to do this even if the function takes no parameters:",
    code: "namedFunctionWithoutParameters()",
    tags: "more blocks parameters"
  }, {
    description: "But you can also create a function without a name, which is called an anonymous function:",
    code: "forever(() => {\n  sprite.x++\n})",
    tags: "anonymous function more blocks"
  },
  {
    description: "Import JavaScript code from an external URL. The second input happens after the code is imported.",
    code: "// import the lodash utility library\n// https://lodash.com/docs/4.17.4\nimportCodeURL('https://cdn.jsdelivr.net/lodash/4.17.4/lodash.min.js', () => {\n _.flatten([1, [2, [3, [4]], 5]])\n})",
    tags: "import code url require firebase library module more blocks"
  },
  {
    description: "To import multiple URLs before running code, you can combine them in an array.",
    code: "importCodeURL(['https://www.gstatic.com/firebasejs/8.6.7/firebase-app.js',\n'https://www.gstatic.com/firebasejs/8.6.7/firebase-analytics.js',\n'https://www.gstatic.com/firebasejs/8.6.7/firebase-firestore.js'], runGame)",
    tags: "import code url require firebase library module more blocks"
  },

  {
    description: "A comment is a piece of code that is ignored by your browser. You can use it to separate long code into sections, making it easier to read through and edit. Add a comment block like \"Instructions\" or \"Create Sprites\" to your code.",
    code: "//------------------------------------------\n//------Instruction Screen Sprites----------\n//------------------------------------------",
    tags: "comment"
  }
  ]
} as const