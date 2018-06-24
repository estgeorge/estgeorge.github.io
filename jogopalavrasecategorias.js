// Jogo Palavras e Categorias
// Versão: 1.0
// Autor: Estéfane

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
var nw, word = [];

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
	for (k=0; k<5; k++) {	
		word[k] = {text:"", active:false, movable:false, cat:"", x:0, y:0, x1:0, y1:0, x2:0, y2:0, tipo:0};
	}	
    
	writer = createWriter('squares.txt');
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
    // Verifica se há palavras desativadas
    for (k=0; k<nw; k++) {
		if (!word[k].active) {
			setNewWord(word[k]);
		}		
	}
	
	// Detecta mudança de nível
	var newLevel = true;
    for (k=0; k<nw; k++) {
		if (word[k].active) {
			newLevel = false;
		}	
	}	
	if (newLevel) {
		level++;
		if (level <= 5) {
			setupLevel();
		}
		else {
			screen = 4;
		}
		return false;
	}
	
	// Detecta se há uma palavra "movable"
	var movable = false;
    for (k=0; k<nw; k++) {
		if (word[k].active && word[k].movable) {
			movable = true;
		}
	}
	
	// Se não existe palavra "movable",
	// então escolha a palavra mais próxima
	// do chão com "movable".
	if (!movable) {
		ymax = 0;
		imax = 0;
		for (k=0; k<nw; k++) {
			if (word[k].active && word[k].y2 > ymax) {
				ymax = word[k].y2;
				imax = k;					
			}
		}	
		word[imax].movable = true;
	}


    for (k=0; k<nw; k++) {	
	
		if (word[k].active) {
	
			// Move as palavras	
			if (word[k].movable) {
				if (keyIsDown(LEFT_ARROW) && word[k].x1>4) {
					word[k].x -= 5;
				}
				if (keyIsDown(RIGHT_ARROW) && word[k].x2<400) {
					word[k].x += 5;
				}
				if (keyIsDown(DOWN_ARROW)) {
					word[k].y += 40;
				}
			}	
			word[k].y += yspeed;
			refleshCoordinates(word[k]);


			// Detecta a colisão
			for (i=0; i<bar.length; i++) {
				if (word[k].x1 < bar[i].x2 && word[k].x2 > bar[i].x1 && word[k].y2 > bar[i].y1) {
					word[k].active = false;
					exPosX = (word[k].x1+word[k].x2)/2-96/2;
					exPosY = (word[k].y1+word[k].y2)/2-96/2;
					exFrame = 0;
					life--;
					if (life<=0) {
						screen = 3;
						return false;
					}			
				}
			}	

			// Verifica se a palavra caiu na categoria correta
			if (word[k].y1>workheight && word[k].active) {
				var success = false;
				if (word[k].x1 > bar[0].x2) {
					for (i=0; i<bar.length-1; i++) {
						if (word[k].x1 < bar[i+1].x1) {
							if (word[k].cat == i && word[k].tipo==1) {
								success = true;
								break;
							}
						}
					}
				}
				if (success) {
					score++;
				}
				word[k].active = false;
			}
		}
    }
	
	///////// Desenha o cenário ///////////////////////////////

	// Desenha o plano de fundo
	push();
	background(180,197,223);
	strokeWeight(5);
    stroke(105, 121, 165);
	line(404, 0, 404, 504);
	pop();

	// Escreve o estado do jogo
	boxText('Pontos',50,20,false);
	boxText(score,90,20,true);
	boxText('Nível',150,20,false);
	boxText(level,190,20,true);
	boxText('Vidas',250,20,false);
	boxText(life,290,20,true);

	// Desenha as barras de obstáculos
	for (i=0; i<bar.length; i++) {
		rect(bar[i].x1,bar[i].y1,bar[i].x2-bar[i].x1,bar[i].y2-bar[i].y1);
	}

	// Escreve o nome das categorias 
	for (i=0; i<cats.length; i++) {
		push()
		x = (bar[i].x2+bar[i+1].x1)/2+3;
		translate(x,490);
		rotate(3*PI/2);
		text(cats[i],0,0);
        pop();
	}

	// Desenha as palavras
	for (k=0; k<nw; k++) {
		if (word[k].active) {
			rotateWord(word[k]);
		}
	}	

	// Mostra o próximo frame da explosão
	if (exFrame<12) {
		image(explosion_img,exPosX,exPosY,96,96,96*exFrame,0,96,96);
		exFrame++;
	}

	return false;

}


// Configura um novo jogo
function setNewGame()
{
	screen = 2;
	level = 1;
	exFrame = 12;	
	setupLevel();
}


// Configura uma nova palavra
function setNewWord(w)
{
	if (words.length==0) {
		return false;
	}
	var r = getRndInteger(0, words.length-1);
	w.text = words[r].text;
	w.cat = words[r].cat;
	w.x = getRndInteger(20,workWidth-20);
	w.y = 0;
	w.tipo = getRndInteger(0, 3);
	w.active = true;
	w.movable = false;
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
		nw = 2;
		yspeed = 1;
		score = 0;
		life = 5;	   
	}
	else if (level == 2) {
		r = getRndCategories(3);
		nw = 2;
		yspeed = 1;
	}
	else if (level == 3) {
		r = getRndCategories(3);
		nw = 2;
		yspeed = 2
	}
	else if (level == 4) {
		r = getRndCategories(3);
		nw = 3;
		yspeed = 2;
	}
	else if (level == 5) {
		nw = 3;
		r = getRndCategories(4);
		yspeed = 2;
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
	for (k=0; k<nw; k++) {	
		word[k].active = false;
	}
	
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
		for (k=0; k<nw; k++) {	
			if (word[k].movable) {
				tipo = word[k].tipo;
				word[k].tipo = (word[k].tipo+1)%4;
				refleshCoordinates(word[k]);
			}
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

function rotateWord(w)
{
	var c, d, i;
	var s = w.text;	
	var wWidth  = s.length*21;
	var wHeight = 21;
    push();
	textSize(15);
    translate(w.x,w.y);
    rotate(angle[w.tipo]);
    for (i=0; i<s.length; i++) {
		if (w.movable) {
			if (i==s.length-1) {
				fill(200);
			}
			else {
				fill(215,215,244);
			}
		}
		else {
			fill(255);
		}
		rect(i*21-wWidth/2,-10,21,21);
		c = s.charAt(i);
		d = (21-textWidth(c))/2;
		fill(0);
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

