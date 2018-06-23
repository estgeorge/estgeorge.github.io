var bar = [], words = [], cats = [], icats = [];
var score, level, life;
var yspeed;
var workWidth = 400;
var workheight = 500;
var screen;
var explosion_img;
var exPosX = 0;
var exPosY = 0;
var exFrame = 12;
var angle = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
var word  = {text:"", active:false, cat:"", x:0, y:0, x1:0, y1:0, x2:0, y2:0, tipo:0};


function preload()
{
	explosion_img = loadImage('assets/explosion.png');
	initial_img = loadImage('assets/initial.png');
	gameover_img = loadImage('assets/gameover.png');
	end_img = loadImage('assets/end.png');
	book_img = loadImage('assets/end.png');
}

function setup()
{
	createCanvas(550, 500);
	textFont('Helvetica');
	frameRate(30);
	screen = 1;
}

function draw()
{
	switch(screen) {
		case 1:
			beginScreen();
			break;
		case 2:
			gameScreen();
			break;
		case 3:
			gameOverScreen();
			break;
		case 4:
			endScreen();
			break;
	}
	return false;
}

function beginScreen()
{
	push();
	background(180,197,223);
	textSize(20)
    fill(0, 0, 128);	
	text("Tecle espaço para iniciar o jogo...",130,420);
    image(initial_img,40,40);
	pop();
}

function endScreen()
{
	background(180,197,223);
    fill(0, 0, 0);		
	image(end_img,0,0);
	textSize(30);
    var s = "Total de pontos: "+score;
	text(s,(500-textWidth(s))/2,350)
	textSize(20)
	text("Tecle espaço para jogar novamente...",100,440);
    image(end_img,0,0);
}


function gameOverScreen()
{
	push();
	background(180,197,223);
	textSize(20)
    fill(0, 0, 128);	
	text("Tecle espaço para jogar novamente...",100,420);
    image(gameover_img,40,40);
	pop();
}


function gameScreen()
{	

	if (!word.active && !setNewWord(word)) {
		level++;
		if (level <= 5) {
			setupLevel();
		}
		else {
			screen = 4;
		}
		return false;
	}

	if (keyIsDown(LEFT_ARROW) && word.x1>4) {
		word.x -= 5;
	}
	if (keyIsDown(RIGHT_ARROW) && word.x2<400) {
		word.x += 5;
	}
	if (keyIsDown(DOWN_ARROW)) {
		word.y += 40;
	}
	word.y += yspeed;
	refleshCoordinates(word);

	// detecta colisão
	for (i=0; i<bar.length; i++) {
		if (word.x1 < bar[i].x2 && word.x2 > bar[i].x1 && word.y2 > bar[i].y1) {
			word.active = false;
			exPosX = (word.x1+word.x2)/2-96/2;
			exPosY = (word.y1+word.y2)/2-96/2;
			exFrame = 0;
			life--;
			if (life<=0) {
				screen = 3;
				return false;
			}			
		}
	}

	// Verifica se a palavra caiu na categoria correta
	if (word.y1>workheight && word.active) {
		var success = false;
		if (word.x1 > bar[0].x2) {
			for (i=0; i<bar.length-1; i++) {
				if (word.x1 < bar[i+1].x1) {
					if (word.cat == i && word.tipo==1) {
						success = true;
						break;
					}
				}
			}
        }
        if (success) {
			score++;
		}
		word.active = false;
	}

	///////// Desenha o cenário ///////////////////////////////

	push();
	background(180,197,223);
	strokeWeight(5);
    stroke(105, 121, 165);
	line(404, 0, 404, 504);
	pop();

	boxText('Pontos',50,20,false);
	boxText(score,90,20,true);
	boxText('Nível',150,20,false);
	boxText(level,190,20,true);
	boxText('Vidas',250,20,false);
	boxText(life,290,20,true);

	for (i=0; i<bar.length; i++) {
		rect(bar[i].x1,bar[i].y1,bar[i].x2-bar[i].x1,bar[i].y2-bar[i].y1);
	}

	for (i=0; i<cats.length; i++) {
		push()
		x = (bar[i].x2+bar[i+1].x1)/2+3;
		translate(x,490);
		rotate(3*PI/2);
		text(cats[i],0,0);
        pop();
	}

	if (word.active) {
		rotateWord(word.text,word.x,word.y,angle[word.tipo]);
	}

	if (exFrame<12) {
		image(explosion_img,exPosX,exPosY,96,96,96*exFrame,0,96,96);
		exFrame++;
	}	

	return false;
}


function setNewGame()
{
	screen = 2;
	level = 1;
	exFrame = 12;	
	setupLevel();
}


// Configura um nova palavra
function setNewWord(w)
{
	if (words.length==0) {
		return false;
	}
	var r = getRndInteger(0, words.length-1);
	w.text = words[r].text;
	w.cat = words[r].cat;
	w.x = 250;
	w.y = 0;
	w.tipo = getRndInteger(0, 3);
	w.active = true;
    refleshCoordinates(w);
	words.splice(r,1); 
	return true;
}


// Configura uma nova fase do jogo
function setupLevel()
{
	var r, i, j, w, d;
	
    words = [];
    cats = [];
    icats = [];	
	if (level == 1) {
		r = getRndCategories(2);
		yspeed = 3;
		score = 0;
		life = 5;	   
	}
	else if (level == 2) {
		r = getRndCategories(3);
		yspeed = 3;
	}
	else if (level == 3) {
		r = getRndCategories(4);
		yspeed = 3
	}
	else if (level == 4) {
		r = getRndCategories(5);
		yspeed = 4;
	}
	else if (level == 5) {
		r = getRndCategories(5);
		yspeed = 5;
	}

	for (i=0; i<r.length; i++) {
	    w = easycat[r[i]]["words"];
		cats.push(easycat[r[i]]["title"]);
		for (j=0; j<w.length; j++) {
			words.push({"text":w[j].toUpperCase(), "cat":i});
		}
	}
	bar = [];
	d = (workWidth - cats.length*55+15)/2;
	for (i=0; i<=cats.length; i++) {
		bar[i] = {x1:d+55*i, y1:420, x2:d+15+55*i, y2:499};
    }
	
	word.active = false;
}

// Retorna um vetor com n índices aleatórios de categorias
function getRndCategories(n)
{
	var i, k, r = [];
	if (icats.length<n) {
		for (i=0; i<easycat.length; i++) {
			icats[i] = i; 
		}
	}
	for (i=0; i<n; i++) {
	    k = getRndInteger(0, icats.length-1);
		r.push(icats[k]);
		icats.splice(k,1); 
	}				   
	return r;
}

function keyPressed()
{
    if (keyCode == UP_ARROW) {
		tipo = word.tipo;
		word.tipo = (word.tipo+1)%4;
		refleshCoordinates(word);
      
		// verifica se pode rotacionar
		if (word.x1<4 || word.x2>400) {
			word.tipo = tipo;
			refleshCoordinates(word);
		}
	}
	if (screen == 1 && keyCode == 32) {
		setNewGame();
	}
	if (screen == 3 && keyCode == 32) {
		setNewGame();
	}	
    return false;
}


function boxText(w,y,size,box)
{
	push();
	textSize(size);
	var x = 400+(150-textWidth(w))/2;
	fill(206, 224, 245);
	stroke(105, 121, 165);
	if (box) {
		rect(425,y-32,100,50);
	}
	noStroke();
	fill(105, 121, 165);
	text(w,x,y);
	pop();
}


function refleshCoordinates(w)
{
	var wWidth  = w.text.length*20;
	var wHeight = 20;
    if (w.tipo==0 || w.tipo==2) {
		w.x1 = w.x-wWidth/2;
		w.y1 = w.y-wHeight/2;
		w.x2 = w.x+wWidth/2;
		w.y2 = w.y+wHeight/2;
	}
	else if (w.tipo==1 || w.tipo==3) {
		w.x1 = w.x-wHeight/2;
		w.y1 = w.y-wWidth/2;
		w.x2 = w.x+wHeight/2;
		w.y2 = w.y+wWidth/2;
	}

}

function rotateWord(s,x,y,a)
{
	var c, d, i;
	var wWidth  = s.length*21;
	var wHeight = 21;
    push();
	textSize(15);
    translate(x,y);
    rotate(a);
    for (i=0; i<s.length; i++) {
		if (i==s.length-1) {
            push();
		    fill(200);
			rect(i*21-wWidth/2,-10,21,21);
			pop();
		}
		else {
			rect(i*21-wWidth/2,-10,21,21);
		}
		c = s.charAt(i);
		d = (21-textWidth(c))/2;
		text(c,i*21+d-wWidth/2,7);
    }
    pop();
}

// This JavaScript function returns a random number
// between min and max (both included):
function getRndInteger(min, max)
{
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

