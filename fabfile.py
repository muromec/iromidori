from fabric.operations import put
from fabric.api import cd, run


def deploy():
    put("data/midori.min.js", "serve/data/midori.min.js")
    put("data/img/char/*sprite.png", "serve/data/img/char/")
    with cd('serve'):
        run('git reset --hard')
        run('git pull --rebase')
