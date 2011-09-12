from jinja2 import Environment, FileSystemLoader

def env(domain, upd_ctx, theme='main', **ctx):
    upd_ctx['tpl_env'] = Environment(
            loader=FileSystemLoader( [ 
                    "./domains/%s/templates/" % domain,
                    './templates/themes/%s/' % theme,
                    './templates', 
            ])
    )


def render(tpl, tpl_env, **ctx):
    template = tpl_env.get_template(tpl)

    return template.render(**ctx)
