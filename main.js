const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: 0xffe4ec,
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: { preload, create, update }
};

let player, cursors, doors, dialogBox, currentDialog, heartParticles, correctSound, dingSound, taDaSound;

new Phaser.Game(config);

function preload() {
  this.load.image('hotel', 'assets/hotel.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('door_closed', 'assets/door_closed.png');
  this.load.image('door_open', 'assets/door_open.png');
  this.load.image('heart', 'assets/heart_particle.png');
  this.load.audio('correct', 'assets/ding.wav');
  this.load.audio('taDa', 'assets/tada.wav');
}

function create() {
  this.add.image(400, 300, 'hotel');
  player = this.physics.add.sprite(400, 500, 'player').setScale(0.5);
  cursors = this.input.keyboard.createCursorKeys();

  doors = this.physics.add.group();
  const rooms = [
    { x: 200, y: 150, q: "What's my favorite dessert?", a: "ice cream" },
    { x: 600, y: 150, q: "What’s my favorite food?", a: "pizza" },
    { x: 200, y: 400, q: "Which movie reminds you of us?", a: "titanic" },
    { x: 600, y: 400, q: "Are you ready for our staycation?", a: "yes" }
  ];

  rooms.forEach(r => {
    const door = doors.create(r.x, r.y, 'door_closed').setInteractive();
    door.data = r;
    door.opened = false;
  });

  this.physics.add.overlap(player, doors, onDoorOverlap, null, this);

  dialogBox = createDialog(this);
  heartParticles = this.add.particles('heart').createEmitter({
    x: 400, y: 0, lifespan: 2000, speedY: { min: 50, max: 100 },
    scale: { start: .5, end: 0 }, quantity: 1, frequency: 200
  });
  correctSound = this.sound.add('correct');
  taDaSound = this.sound.add('taDa');
}

function update() {
  player.body.setVelocity(0);
  if (cursors.left.isDown) player.body.setVelocityX(-200);
  if (cursors.right.isDown) player.body.setVelocityX(200);
  if (cursors.up.isDown) player.body.setVelocityY(-200);
  if (cursors.down.isDown) player.body.setVelocityY(200);
}

function onDoorOverlap(player, door) {
  if (!door.opened) showQuestion(door);
}

function showQuestion(door) {
  currentDialog = door;
  dialogBox.querySelector('p').textContent = door.data.q;
  dialogBox.style.display = 'block';
  dialogBox.querySelector('input').value = '';
}

function submitAnswer() {
  const input = dialogBox.querySelector('input').value.trim().toLowerCase();
  if (input === currentDialog.data.a) {
    correctSound.play();
    currentDialog.opened = true;
    currentDialog.setTexture('door_open');
    dialogBox.style.display = 'none';
    if (doors.countActive() === 0) endGame();
  } else alert('Oops! Try again ❤️');
}

function createDialog(scene) {
  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'absolute', bottom: '20px', left: '50%',
    transform: 'translateX(-50%)', width: '300px', padding: '15px',
    background: 'white', borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', textAlign: 'center', fontFamily: 'comic sans ms'
  });
  const p = document.createElement('p');
  const input = document.createElement('input');
  Object.assign(input.style, { width: '90%', padding: '8px', margin: '10px 0' });
  const btn = document.createElement('button');
  btn.textContent = 'Submit ❤️';
  btn.onclick = submitAnswer;
  box.append(p, input, btn);
  document.body.append(box);
  return box;
}

function endGame() {
  taDaSound.play();
  setTimeout(() => alert("🏨 Staycation Unlocked! Let’s enjoy our 2nd date 💖"), 300);
}
