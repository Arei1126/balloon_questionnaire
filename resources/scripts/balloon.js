export class scene0 extends Phaser.Scene {
	constructor() {
		// 親クラス（Phaser.Scene）のコンストラクタを呼び出すのはマスト！
		super({ key: 'GameScene' });
	}
	preload () {
		this.load.image("bg", "./resources/img/bg.png");
		this.load.image("balloonR", "./resources/img/balloonR.png");
		this.load.image("balloonG", "./resources/img/balloonG.png");
		this.load.image("balloonB", "./resources/img/balloonB.png");
		this.load.image("hand_open", "./resources/img/hand_open.png");
		this.load.image("hand_close", "./resources/img/hand_close.png");
	}

	create () {
		// オブジェクトを生成する！
		// この中のthisはgameの方
		this.add.image(500,500, "bg");

		this.balloonR =  this.add.image(333,500, "balloonR");
		const hand0 = this.add.image(333,500, "hand_close");


		this.balloonG =  this.add.image(666,500, "balloonG");
		const hand1 = this.add.image(666,500, "hand_close");

		this.balloonB =  this.add.image(999,500, "balloonB");
		const hand2 = this.add.image(999,500, "hand_close");

		this.balloons = [this.balloonR, this.balloonG, this.balloonG];
		this.closeHands = [hand0, hand1, hand2];


	}

	update() {
		// ここにフレームごとに実行される処理を書くよ！
		// プレイヤーの移動とか、当たり判定とかね！
	}

};

export class balloon {
	constructor(signal, canvas, data){
		this.signal = signal;
		this.canvas = canvas;
		this.data = data;


		const config = {
			type: Phaser.CANVAS, // もちろんPhaser.AUTOでOK!
			width: 1000,
			height: 1000,
			canvas: canvas, // ここがポイント！既存のcanvasをここに指定するんだからね！
			scene: [scene0]
		};

		// 設定をPhaser.Gameに渡してインスタンスを作成！
		this.game = new Phaser.Game(config);

		/*
		// Phaserのゲームが作成されたら…
		this.game.events.on('ready', () => {
			// Phaserの自動更新を一時停止させる
			//this.game.loop.pause();
		});

		function update(){

			this.game.balloonR.y  += 0.01;
		};
		*/
		
		
		this.signal.addEventListener("restAll",()=>{

		});

	}
	

}
