`use strict`
//import { balloon } from "./balloon.js" 
const DEMO_ADD_MANY = 10;
const ANSWER_STATUS_VOTED = "あなたは回答済み";
const ANSWER_STATUS_UNVOTED = "あなたは未回答";

const SCALE_TIMING = [3, 10, 50, 100, 500 ,1000, 5000, 10000, Infinity]

function toPolar(dx, dy) {
    // 左上原点（Y軸下向きが正）を考慮して、Yを反転させてから計算するよん！
    const normalY = -dy;
    
    // 距離（r）は、ピタゴラスの定理で求めるよ！超基本だね！
    const r = Math.sqrt(dx * dx + normalY * normalY);
    
    // 角度（theta）は、Math.atan2を使うのが最高に便利だよ！
    // 角度の範囲は -π から π になるよん！
    const theta = Math.atan2(normalY, dx);
    
    return { r, theta };
}



function toCartesian(r, theta) {
    // X方向の相対位置は、r * cos(theta) で求められるよん！
    const dx = r * Math.cos(theta);
    
    // Y方向は、r * sin(theta) で求めるんだけど、
    // 左上原点に戻すために、最後に-1倍するのを忘れないでね！
    const normalY = r * Math.sin(theta);
    const dy = -normalY;
    
    return { dx, dy };
}

class server {	// phpによるバックエンドの代替
	constructor(){
		this.data = {
			"result": [0,0,0]
		};
	}

	vote(choice){
		if(0 <= choice <= 2){
			this.data.result[choice] += 1;
		}
	}

	readAll(){
		return this.data["result"]
	}

	clearAll(){
		this.data["result"] = [0,0,0]
	}

}


const Data = {	// グローバル変数
	"answered": false,
	"result": [0,0,0],
	"startY": 0		// touchmove用
}

const DisplayData = {	// 描画用グローバル変数
	"voted_id": null,
	"result": [0,0,0],
	"scale": 0.1,
	"target_index": 0, 
}


function getRandomInt(min, max) {
    // 最小値と最大値を整数に変換
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function num(str) {	
	// foo-bar-123 から123を返す
	const parts = str.split('-');
	const lastPart = parts[parts.length - 1];
	const number = Number(lastPart);
	if (!isNaN(number)) {
		return number;
	} else {
		return null;
	}
}

window.addEventListener("load", async ()=>{

	const x = 10
	const y = 10

	const polar = toPolar(x, y);
	console.info(polar)
	const pos = toCartesian(polar.r, polar.theta)
	console.info(pos);

	const sound_break = document.querySelector("#sound_break");

	const main_canvas = document.querySelector("#main-canvas");

	// 必要なDOM要素
	const control_add = document.querySelector("#control-add");
	const control_reset = document.querySelector("#control-reset");
	const control_addmany = document.querySelector("#control-addmany");

	const instruction_0 = document.querySelector("#instruction-0")
	const instruction_1 = document.querySelector("#instruction-1")
	const answer_status = document.querySelector("#answer-status")

	const results = document.querySelectorAll(".result");

	const choices = document.querySelectorAll(".choice");

	const Server = new server()	// バックエンドの代わり

	const Signal = document.createElement("div");	// 様々なイベントを仲介する

	Signal.addEventListener("choiced", (ev) => {	
		// 回答操作を受けた
		console.log(ev.detail);
		if(!Data["answered"]){
			Server.vote(ev.detail);
			answer_status.innerText = ANSWER_STATUS_VOTED;
			Data.answered = true;
			sound_break.play();
		}

	});

	Signal.addEventListener("resetAll",()=>{
		// 画面上の風船をリセットする処理もひつよう
		Server.clearAll();
		Data.answered = false;
		answer_status.innerText = ANSWER_STATUS_UNVOTED;
		Data.result = [0,0,0]
		for (const result of results){
			const counter = result.querySelector(".result-counter");
			counter.innerText = 0;
		};
	});

	Signal.addEventListener("add",()=>{
		// 一人がもう一度回答することができるようにする処理
		// なにか、画面上の風船をリセットする処理もひつよう
		Data.answered = false;
		answer_status.innerText = ANSWER_STATUS_UNVOTED;
	});

	Signal.addEventListener("addMany",()=>{
		// デモ用に回答をたくさん追加する処理
		for (let i = 0; i < DEMO_ADD_MANY; i++){
			Server.vote(getRandomInt(0, 2));
		}
	});

	Signal.addEventListener("voteAdded", (ev)=>{
		// 画面更新用
		// 回答を追加する処理
		const counter = results[ev.detail.choice].querySelector(".result-counter");
		counter.innerText = Number(counter.innerText) + Number(ev.detail.diff);
	});

	instruction_0.addEventListener("pointerup", ()=>{ // 上へ
		const ev = new CustomEvent("switchScene", {
				detail: 1
			});
			Signal.dispatchEvent(ev); 
	});

	instruction_1.addEventListener("pointerup", ()=>{ // 上へ
		const ev = new CustomEvent("switchScene", {
				detail: 0
			});
			Signal.dispatchEvent(ev); 
	});

	document.addEventListener("wheel", (e)=>{
		const delta = e.deltaY;
		if(delta < 5){
			const ev = new CustomEvent("switchScene", {
				detail: 1
			});
			Signal.dispatchEvent(ev);
		}
		else if(delta > 5){
			const ev = new CustomEvent("switchScene", {
				detail: 0
			});
			Signal.dispatchEvent(ev);

		}
	});

	document.addEventListener('touchstart', (event) => {
		// 指が1本だけの操作を検知したいから、touches[0]を使うよ！
		// 複数の指のタッチに対応したい場合は、もっと複雑な処理が必要だけど、今回はシンプルにいくね！
		Data.startY = event.touches[0].clientY;
	});

	document.addEventListener("touchmove", (event)=>{
		const currentY = event.touches[0].clientY;

		// 開始位置からの移動量を計算するよ！
		const delta = currentY - Data.startY;
		if(delta > 50){
			const ev = new CustomEvent("switchScene", {
				detail: 1
			});
			Signal.dispatchEvent(ev);
		}
		if(delta < 50){
			const ev = new CustomEvent("switchScene", {
				detail: 0
			});
			Signal.dispatchEvent(ev);

		}
		//Data.startY = 0;

	});

	for (const choice of choices){
		choice.addEventListener("pointerup", ()=>{
			const ev = new CustomEvent("choiced", {
				detail: num(choice.id) 
			});
			Signal.dispatchEvent(ev);
		});
	};

	control_reset.addEventListener("pointerup", ()=>{
		const ev = new CustomEvent("resetAll", {});
		Signal.dispatchEvent(ev);
	});

	control_add.addEventListener("pointerup", ()=>{
		const ev = new CustomEvent("add", {});
		Signal.dispatchEvent(ev);
	});

	control_addmany.addEventListener("pointerup", ()=>{
		const ev = new CustomEvent("addMany", {});
		Signal.dispatchEvent(ev);
	});



	const ev = new CustomEvent("resetAll", {});
	Signal.dispatchEvent(ev);


	class scene0 extends Phaser.Scene {
		constructor() {
			// 親クラス（Phaser.Scene）のコンストラクタを呼び出すのはマスト！
			super({ key: 'scene0' });
			Signal.addEventListener("switchScene",(ev)=>{
				if(ev.detail == 1){
					this.scene.start("scene1");
				}
			});

			this.reset = () => {
				const offset_y = 0;
				const d = 166.6;
				const scale_b = 0.65 
				const scale_hand = 0.5
				// オブジェクトを生成する！
				// この中のthisはgameの方
				this.add.image(500,500, "bg");

				this.balloonR =  this.add.image(d,offset_y + 500, "balloonR");
				const hand0 = this.add.image(d,500, "hand_close");


				this.balloonG =  this.add.image(d*3,offset_y + 500, "balloonG");
				const hand1 = this.add.image(d*3,500, "hand_close");

				this.balloonB =  this.add.image(d*5,offset_y + 500, "balloonB");
				const hand2 = this.add.image(d*5,500, "hand_close");

				this.balloons = [this.balloonR, this.balloonG, this.balloonB];
				this.balloons.forEach((b) => {b.setScale(scale_b);});

				this.closeHands = [hand0, hand1, hand2];
				this.closeHands.forEach((h) => {h.setScale(scale_hand);});
				this.closeHands.forEach((h) => {h.y = offset_y + 730;});
				this.closeHands.forEach((h) => {h.x += 55;});

				const hand_open_0 = this.add.image(d,500, "hand_open");
				const hand_open_1 = this.add.image(d*3,500, "hand_open");
				const hand_open_2 = this.add.image(d*5,500, "hand_open");
				this.openHands = [hand_open_0, hand_open_1, hand_open_2];
				this.openHands.forEach((h) => {h.setScale(scale_hand);});
				this.openHands.forEach((h) => {h.y = offset_y + 730;});
				this.openHands.forEach((h) => {h.x += 55;});
				this.openHands.forEach((h) => {h.setAlpha(0);});

			}


			this.reset_after_voted = () => {
				this.reset()
				const id = DisplayData.voted_id;
				this.balloons.forEach((b) => {b.setAlpha(0);});
				this.closeHands[id].setAlpha(0);
				this.openHands[id].setAlpha(1);
			}



			Signal.addEventListener("resetAll",()=>{
				this.reset();
				DisplayData.voted_id = null;
				console.log("resetAll!");
			});

			Signal.addEventListener("add",()=>{
				this.reset();
				DisplayData.voted_id = null;
			});

			Signal.addEventListener("choiced", (ev) => {	

				if(DisplayData.voted_id == null){  // 初回の操作であること
					//this.closeHands.forEach((h) => {h.setAlpha(0);});
					//this.openHands.forEach((h) => {h.setAlpha(1);});

					// 回答操作を受けた
					const id = ev.detail;
					for (let i = 0; i < this.balloons.length; i++){
						if(i !== id){
							this.balloons[i].setAlpha(0);
						}
						else{
							this.closeHands[i].setAlpha(0);
							this.openHands[i].setAlpha(1);

						}
					}
					DisplayData.voted_id = id;
				}
			});



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
		if(DisplayData.voted_id == null){
				this.reset();
			}else{
				this.reset_after_voted();
			}
		
		}

		update() {
			if(DisplayData.voted_id !== null){
				this.balloons[DisplayData.voted_id].y -= 10;
			}
		}



	};
	
	class scene1 extends Phaser.Scene {
		constructor() {
			// 親クラス（Phaser.Scene）のコンストラクタを呼び出すのはマスト！
			super({ key: 'scene1' });
			Signal.addEventListener("switchScene",(e)=>{
				if(e.detail == 0){
					this.scene.start("scene0");
				}
			});

			Signal.addEventListener("resetAll",()=>{
				DisplayData.voted_id = null;
				DisplayData.result = [];
				DisplayData.scale = 0.1;
				DisplayData.target_index = 0;
				if(this.scene.isActive("scene1")){
					for(let id = 0; id < this.Balls.length; id++){
						for(const Ball of this.Balls[id]){
							this.matter.world.remove(Ball.body);
							Ball.image.destroy();
						}
					}
				}
				this.Balls = [[],[],[]];

			});

			this.Balls = [[],[],[]];

			this.adjZoom = (results) => {
				console.info(this.Balls);
				let sum = 0;
				for (const res of results){
					sum += res;
				}

				if(sum > SCALE_TIMING[DisplayData.target_index]){
					DisplayData.target_index++;
				}
				else{
					return;
				}
				
				//const isPowerOfTen = Number.isInteger(Math.log(sum));

				// iが10, 100, 1000...に一致したら
				//if (!isPowerOfTen) {
					//return;
				//}
				console.log("スケール変更");
				//const scale = 1/Math.sqrt(sum);



				const scale = 0.1;
				//const scale = DisplayData.scale * Math.pow(0.95, sum)
				DisplayData.scale = scale;
				console.log("スケール: "+ scale); 
				for(let id = 0; id < this.Balls.length; id++){
					for(const Ball of this.Balls[id]){
						const index = this.Balls[id].indexOf(Ball);
						if(index < 0){
							continue;  // 空ならやらない
						}


						const body = Ball.body;
						const image = Ball.image;




						const prev_x = body.position.x
						const prev_y = body.position.y

						const pos_polar = toPolar(prev_x - 500, prev_y - 500);
						pos_polar.r = pos_polar.r * scale;
						const pos = toCartesian(pos_polar.r, pos_polar.theta);
						
						const radius = 250*scale;
						const x = pos.dx + 500;
						const y = pos.dy + 500;
						const newBody = this.matter.bodies.circle(x,y,radius, {
							restitution: 0.8*DisplayData.scale, // 弾性を少し持たせるよ！
								density: 0.1/DisplayData.scale^2 // 密度を低くして軽くするよ！
						});
						let ballImage = null;
						switch(id){
							case 0:
								ballImage = this.add.image(x, y, 'balloonR');
								break;

							case 1:
								ballImage = this.add.image(x, y, 'balloonG');
								break;

							case 2:
								ballImage = this.add.image(x, y, 'balloonB');
								break;
						}

						ballImage.setScale(scale);

						// 物理ボディをワールドに追加するよ！
						this.matter.world.add(newBody);

						// オブジェクトの配列にプッシュして、後で管理できるようにしておくよ！
						this.Balls[id][index] = { body: newBody, image: ballImage };
						
						// 前のやつは殺す
						//this.Balls[id].splice(index,1);
						this.matter.world.remove(body);
						image.destroy();





					}
				}
		
			};


			this.spawn = (results) =>{
				

				const addBall = (id) => {
					const d = 166.6;
					const x = d*(1+ 2*id)
					const y = this.cameras.main.height;

					// 画像オブジェクトを作成するよ！
					let ballImage = null;
					switch(id){
						case 0:
							ballImage = this.add.image(x, y, 'balloonR');
							break;

						case 1:
							ballImage = this.add.image(x, y, 'balloonG');
							break;

						case 2:
							ballImage = this.add.image(x, y, 'balloonB');
							break;
					}
					const radius = 250*DisplayData.scale;
					ballImage.setScale(DisplayData.scale); // 画像のスケールを調整するよ！

					// 円形の物理ボディを作成するよ！
					const circleBody = this.matter.bodies.circle(x, y, radius, {
						restitution: 0.8*DisplayData.scale, // 弾性を少し持たせるよ！
						density: 0.1/DisplayData.scale^2 // 密度を低くして軽くするよ！
					});
					//ballImage.setScale(DisplayData.scale);
					// 物理ボディをワールドに追加するよ！
					this.matter.world.add(circleBody);

					// オブジェクトの配列にプッシュして、後で管理できるようにしておくよ！
					this.Balls[id].push({ body: circleBody, image: ballImage });
				}
				for (let i = 0; i < results.length; i++){
					for(let n = 0; n < results[i]; n++){
						addBall(i)
					}
				}


			}

			Signal.addEventListener("voteAdded",async  (e) => {  // 表示中の場合、差分だけ増やす
				if(this.scene.isActive()){
					const id = e.detail.choice;
					const diff = e.detail.diff;
					const Diff = [0,0,0];
					Diff[id] = diff;
					await this.spawn(Diff);
					//this.adjZoom(Data.result);
				}
			})

		}



		preload(){
			this.load.image("bg", "./resources/img/bg.png");	

			this.load.image("bg_sora", "./resources/img/bg_sora.png");
			this.load.image("balloonR", "./resources/img/balloonR.png");
			this.load.image("balloonG", "./resources/img/balloonG.png");
			this.load.image("balloonB", "./resources/img/balloonB.png");

		}

		create(){
			this.add.image(500,500, "bg_sora");

			this.center = new Phaser.Math.Vector2(
				this.cameras.main.width / 2,
				this.cameras.main.height / 2
			);
			
			// 本当はここで描画以外のグローバル変数にアクセスしたくはない。
			this.spawn(Data.result);
			//this.adjZoom(Data.result);

		}

		update(){
			this.Balls.forEach(Ball => {		// 各色、各ボールについてなんとかする
				Ball.forEach(ballData => {
					const { body, image } = ballData;

					// 物理ボディの位置に合わせて画像の位置を更新するよ！
					image.x = body.position.x;
					image.y = body.position.y;

					// 中心からの方向ベクトルを計算するよ！
					const direction = this.center.clone().subtract(new Phaser.Math.Vector2(body.position.x, body.position.y));

					// 距離の二乗で重力の強さを調整するよ！
					const distanceSq = direction.lengthSq();
					let forceMagnitude = 1 * (1000000 / (distanceSq + 1)); 
					if(forceMagnitude > 10){
						forceMagnitude = 10;
					}

					// 力を加えるよ！
					const force = direction.normalize().scale(forceMagnitude);
					this.matter.body.applyForce(body, body.position, force);

					// ダンピング（減衰）をかけるよ！
					const damping = 0.95; // 0.95は少し減衰、0.5は大きく減衰
					const velocity = body.velocity;
					velocity.x = velocity.x * damping;
					velocity.y = velocity.y * damping;
					this.matter.body.setVelocity(body, velocity );



				});
			});

			{		// zoomをする

			}

		}
	}

	const config = {
		type: Phaser.CANVAS, // もちろんPhaser.AUTOでOK!
		width: 1000,
		height: 1000,
		canvas: main_canvas, // ここがポイント！既存のcanvasをここに指定するんだからね！
		scene: [scene0, scene1],
		physics: {
			default: 'matter',
			matter: {
				debug: false,
				gravity: { x: 0, y: 0 }
			}
		}
	};

	const game = new Phaser.Game(config);

	async function update(){
		const serverData = Server.readAll();
		for (let i = 0; i < Data.result.length; i++){
			if(Data.result[i] == serverData[i]){
				continue;
			}
			else {
				const diff = serverData[i] - Data.result[i]

					const ev = new CustomEvent("voteAdded", {
						detail: {
							"choice": i,
							"diff": diff
						}
					});
					Signal.dispatchEvent(ev);
				Data.result[i] = serverData[i]
			}
			
		}

		window.requestAnimationFrame(update)
	}

	await update()

});
