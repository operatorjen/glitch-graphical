# Graphical

A realtime blackboard to collaborate on.

Current known issues:

1. Writes a full jpeg to broadcast to connected users. This causes usability issues where an image is sent and replaces your canvas before you have completed your draw event. This may cause your image to undo your output. Todo: send each individual draw properties instead of an entire image.