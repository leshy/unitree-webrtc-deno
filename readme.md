# intro

This lib just does a webrtc handshake with unitree go2 using the new method

Can connect directly to LocalSTA or AP mode robots on the same network.

I assume that over-the-net unitree signaling server usage can be implemented
easily but I'm working with region locked robot so can't work on this.

this repo is using the new auth method, wrote the js referring to
[legion1581 py repo](https://github.com/legion1581/go2_webrtc_connect/blob/5addbf9a0f8c38259335f0fe6ec9271e0bdf7873/go2_webrtc_driver/unitree_auth.py#L197)

# details

- switched to nodejs from deno in order to support
  [@roamhq/wrtc](https://github.com/WonderInventions/node-webrtc) bindings.

- Other DIY webrtc implementations haven't worked, I tried
  [node-datachannel](https://github.com/murat-dogan/node-datachannel),
  [@cubicleai/wrtc](https://github.com/cubicleai/wrtc) and
  [webrtc-polyfil](https://github.com/ThaUnknown/webrtc-polyfill)

- deno.json exist in the project only because deno lsp server is good

- [node-forge](https://github.com/digitalbazaar/forge) for PKCS1-V1_5 RSA

- pure ts ECB AES implementation pulled out of
  [aes-cross](https://github.com/keel/aes-cross) package. (had to modify it to
  remove window. references)

# running

```sh
git checkout git@github.com:leshy/node-unitree-webrtc.git
cd node-unitree-webrtc
npm install
npm run test 192.168... # robot ip
```

# tnx

for awesome help from

[tfoldi](https://github.com/tfoldi/)

[legion1581](https://github.com/legion1581/)
