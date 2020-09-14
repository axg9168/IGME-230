WebFont.load
({
    google: {
      families: ['Megrim']
    },
    active:e=>{
        console.log("font loaded!");
        // pre-load the images
        PIXI.loader.
        add(["images/constellations/1.png","images/star.png"]).
        on("progress",e=>{console.log(`progress=${e.progress}`)}).
        load(setup);
    }
});