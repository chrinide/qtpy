#!/usr/bin/env python
#
# Copyright (C) 2010-2012 John Driscoll <johnoliverdriscoll@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


# QTPy Main app code

import sys
import web
import yaml
import elixir
from getmove import GetMoveHandler

class QTPy(web.application):
  def run(self, host, port, *middleware):
    return web.httpserver.runsimple(
      self.wsgifunc(*middleware),
      (host, port))

class IndexHandler:
  def GET(self):
    return web.template.frender('static/index.html')()

class ManifestHandler:
  def GET(self):
    web.header('Content-Type', 'text/cache-manifest')
    return web.template.frender('static/qtpy.manifest')()

# Load config
config = yaml.load(file(sys.argv[1], 'r'))
# Set debugging on or off
web.config.debug = bool(config.get('debug', 'True'))
# set db connection string
elixir.metadata.bind = config.get('db', None)
# Load db models
from botmoves import BotMoves
from botmovesmapped import BotMovesMapped
elixir.setup_all()

# Serve our paths
QTPy(('/', IndexHandler,
      '/qtpy.manifest', ManifestHandler,
      '/getmove', GetMoveHandler
      )).run(config.get('host', '0.0.0.0'),
             config.get('port', 8080))
