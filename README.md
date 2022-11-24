Whiplash API Server needs the cluster configuration details as a configMap

***NOTE:*** Create your own user config, just make sure it has rights to the `namespace: whiplash`

```bash
kubectl -n whiplash create cm whiplash-cluster-config --from-file=cluster.yaml=.kube/config
```
The SSH key used by the tunnel client is referenced by 'ssh-master' secret in whiplash namespace

```bash
kubectl -n whiplash create secret generic ssh-master --from-file=id_rsa=<YOUR ID KEY FILE>
```

Finally, apply the deployment of Whiplash

```bash
kubectl apply -f operator/whiplash-operator.yaml
```

Check the pods are running: 
```bash
kubectl get pods -n whiplash
```

```yaml
NAME                        READY   STATUS    RESTARTS   AGE
whiplash-674dd54bbb-kl8g7   2/2     Running   0          11m
```

Whiplash creates a tiny Pod with one container from  `"image": "nowsci/sshtunnel"`


![Screen Shot 2022-11-24 at 11 02 28 am](https://user-images.githubusercontent.com/107200645/203667972-1d9c8091-f8e3-47b2-b050-2868913ab209.png)




# BUILD IT YOURSELF 
To build to dashboard web directory you must have Ionic CLI installed;

```bash
npm install -g @ionic/cli
```

Build the web directory 
```bash
ionic build web --prod
```

Build the Whiplash Dashboard docker image:
```bash
docker buildx build --platform=linux/amd64 -t jadsy2107/whiplash .
```

Build the Whiplash API Server docker image 
```bash
cd server/
docker buildx build --platform=linux/amd64 -t jadsy2107/whiplash-server .
```
