from iromidori.util import err

class CharStats(object):
    def __init__(self):
        print 'init stats'

    @property
    def dead(self):
        return self.stat['hp'] < 1


def hp_check(who, **kw):
    if who.dead:
        return err("You are dead")

