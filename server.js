var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var config = require('./config.js');

app.set('port', config.port);
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function (request, response)
{
    response.sendFile(path.join(__dirname + '/static', 'index.html'));
});

var players = {};
io.on('connection', (socket) =>
{
    socket.on('disconnect', () => 
    {
        delete players[socket.id];
    });

    socket.on('new player', () =>
    {
        players[socket.id] = {
            x: 300,
            y: 300
        };
    });

    socket.on('movement', (data) =>
    {
        var player = players[socket.id] || {};
        if (data.left)
        {
            player.x -= config.player_speed;
        }
        if (data.up)
        {
            player.y -= config.player_speed;
        }
        if (data.right)
        {
            player.x += config.player_speed;
        }
        if (data.down)
        {
            player.y += config.player_speed;
        }
    });

    socket.on('shoot', (data) =>
    {
        var player = players[socket.id] || {};
        if (!player.projectile) player.projectile = {};
        if (player.projectile.time > 0) return;
        if (data == 'left')
        {
            player.projectile.direction = 'left';
        }
        if (data == 'up')
        {
            player.projectile.direction = 'up';
        }
        if (data == 'right')
        {
            player.projectile.direction = 'right';
        }
        if (data == 'down')
        {
            player.projectile.direction = 'down';
        }
        player.projectile.x = player.x + 15;
        player.projectile.y = player.y + 15;
        player.projectile.time = config.projectile_max_frame;
    });
});

function CarpismaKontrol(oyuncu)
{
    if (!oyuncu.projectile) return;
    var proj = oyuncu.projectile;
    if (proj.time < 1) return;
    for (id in players) 
    {
        var player = players[id];
        if(oyuncu == player) continue;
        if((proj.x >= player.x && proj.x <= player.x + 40) && (proj.y >= player.y && proj.y <= player.y + 40))
        {
            proj.time = 0;
            delete players[id];
        }
    }
}

function Guncelle()
{
    for (id in players) 
    {
        var player = players[id];
        if (!player.projectile) continue;
        if (player.projectile.time < 1) continue;
        player.projectile.time--;
        switch (player.projectile.direction)
        {
            case 'left':
                player.projectile.x -= config.projectile_speed;
                break;
            case 'right':
                player.projectile.x += config.projectile_speed;
                break;
            case 'up':
                player.projectile.y -= config.projectile_speed;
                break;
            case 'down':
                player.projectile.y += config.projectile_speed;
                break;
        }
        CarpismaKontrol(player);

    }
    io.sockets.emit('state', players);
}

setInterval(Guncelle, 1000 / 60);


server.listen(config.port, function ()
{
    console.log(`Server Başlatılıyor. Port : ${config.port}`);
});
