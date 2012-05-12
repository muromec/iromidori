from biribiri.chain import Derail

def group_send(send_out, group, **kw):
    group.send(send_out)

def err(msg):
    def send_err(who, **kw):
        who.send({"fn": "err", "data": msg})

    raise Derail(send_err)

