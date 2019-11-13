# Slack Middleware Proxy

The intent of this proxy is to listen for webhook events and if the channel key
contains multiple channels, create separate requests and re-post the payload to
each channel.

Inspired by: https://cliffordhall.com/2016/08/securing-slack-webhooks/
