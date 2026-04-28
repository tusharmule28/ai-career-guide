import asyncio
import json

class NotificationNotifier:
    def __init__(self):
        self.connections = {} # user_id -> list of asyncio.Queue

    def subscribe(self, user_id: int) -> asyncio.Queue:
        if user_id not in self.connections:
            self.connections[user_id] = []
        queue = asyncio.Queue()
        self.connections[user_id].append(queue)
        return queue

    def unsubscribe(self, user_id: int, queue: asyncio.Queue):
        if user_id in self.connections:
            self.connections[user_id].remove(queue)
            if not self.connections[user_id]:
                del self.connections[user_id]

    async def notify(self, user_id: int, data: dict):
        if user_id in self.connections:
            for queue in self.connections[user_id]:
                await queue.put(data)

# Singleton instance
notifier = NotificationNotifier()
