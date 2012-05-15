from fabric.operations import put

def deploy():
    put("data/js/*js", "serve/data/js/")
    put("data/img/char/*sprite.png", "serve/data/img/char/")
