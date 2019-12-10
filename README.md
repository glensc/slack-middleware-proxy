# Slack Middleware Proxy

To solve problem that GitLab Slack integration can't post to multiple channels
([#14080]), this proxy was created.

The intent of this proxy is to listen for webhook events and if the channel key
contains multiple channels, create separate requests and re-post the payload to
each channel.

Inspired by:
- https://cliffordhall.com/2016/08/securing-slack-webhooks/

Similar project:
- https://medium.com/@csgrad/gitlab-multiple-slack-service-integrations-26864084bc91

[#14080]: https://gitlab.com/gitlab-org/gitlab/issues/14080
