import asyncio
import logging

import paho.mqtt.client as mqtt

logger = logging.getLogger(__name__)
logger.info("AsyncioHelper")
logger.setLevel(logging.WARNING)
mqtt_helper_logger = logging.getLogger("mqtt_helper")
mqtt_helper_logger.setLevel(logging.WARNING)


class AsyncioHelper:
    def __init__(self, loop, client):
        self.loop = loop
        self.client = client
        self.client.on_socket_open = self.on_socket_open
        self.client.on_socket_close = self.on_socket_close
        self.client.on_socket_register_write = self.on_socket_register_write
        self.client.on_socket_unregister_write = self.on_socket_unregister_write
        self.misc_is_running = False

    def on_socket_open(self, client, userdata, sock):
        logger.info("Socket opened")

        def cb():
            logger.info("Socket is readable, calling loop_read")
            client.loop_read()

        self.loop.add_reader(sock, cb)
        self.misc = self.loop.create_task(self.misc_loop())

    def on_socket_close(self, client, userdata, sock):
        logger.info("Socket closed")
        self.loop.remove_reader(sock)
        self.misc.cancel()

    def on_socket_register_write(self, client, userdata, sock):
        logger.info("Watching socket for writability.")

        def cb():
            logger.info("Socket is writable, calling loop_write")
            client.loop_write()

        self.loop.add_writer(sock, cb)

    def on_socket_unregister_write(self, client, userdata, sock):
        logger.info("Stop watching socket for writability.")
        self.loop.remove_writer(sock)

    async def misc_loop(self):
        logger.info("misc_loop started")
        msg = self.client.loop_misc()
        while msg == mqtt.MQTT_ERR_SUCCESS:
            try:
                await asyncio.sleep(1)
            except asyncio.CancelledError:
                break
            msg = self.client.loop_misc()
            self.misc_is_running = True
        self.misc_is_running = False
        logger.info("misc_loop finished")
