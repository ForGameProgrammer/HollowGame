var socket = io();

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
}
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        case 87: // W
            movement.up = true;
            break;
        case 68: // D
            movement.right = true;
            break;
        case 83: // S
            movement.down = true;
            break;
        case 37: // Sol
            socket.emit('shoot', 'left');
            break;
        case 38: // Yukarı
            socket.emit('shoot', 'up');
            break;
        case 39: // Sağ
            socket.emit('shoot', 'right');
            break;
        case 40: // Aşağı
            socket.emit('shoot', 'down');
            break;
        case 13:
            YeniOyuncu();
            break;

    }
});


document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
    }
});

YeniOyuncu();

setInterval(() => {
    socket.emit('movement', movement);
}, 1000 / 60);


function YeniOyuncu() {
    socket.emit('new player');
}

var canvas = document.getElementById('canvas');

var context = canvas.getContext('2d');

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

socket.on('state', function (players) {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (var id in players) {
        context.fillStyle = "#3366ff";
        var player = players[id];
        context.fillRect(player.x, player.y, 40, 40);
        if (!player.projectile) continue;
        if (player.projectile.time <= 0) continue;
        context.fillStyle = "#FF5834";
        context.fillRect(player.projectile.x, player.projectile.y, 10, 10);
    }
});



