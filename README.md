Created in a week as part of my application to work at reddit.  QTPy is a
machine-learning strategist and the first Quantum Tic-tac-toe playing bot.


# Install

You'll first need to install the python-webpy, python-sqlalchemy and
python-elixir packages.  In addition, you will need to set up a database
supported by SQLAlchemy.

Next, create a YAML config file that points to the database you created:
    echo "db: postgres://qtpy@localhost/qtpy" > config.yaml

Now you'll have to create the tables.  Don't worry; it's easy.  Hack this
into a terminal from inside the application directory:
    $ python
    >>> import yaml, elixir, botmoves, botmovesmapped
    >>> elixir.metadata.bind = yaml.load(file('config.yaml', 'r'))['db']
    >>> elixir.setup_all()
    >>> elixir.create_all()

If it seems like nothing happened, it succeeded.

Now you should be ready to serve it up:
    $ python qtpy.py config.yaml

Go to http://localhost:8080 and play.


# YAML Configuration

db:  The connection URL to the moves database.  Required.
host:  Hostname to bind to.  Defaults to 0.0.0.0.
port:  Port num to bind to.  Defaults to 8080.
debug:  Print debug info on server error.  Defaults to true.
