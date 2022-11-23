import { Request, Response, NextFunction, raw } from 'express';
import axios, { AxiosResponse } from 'axios';
import {v4 as uuidv4} from 'uuid';
import * as net from 'net'

const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromFile('cluster.yaml');
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);



interface Tunnel {
    TUNNEL_USER: String;
    REMOTE_HOST: String;
    REMOTE_PORT: Number;
    TUNNEL_HOST: String;
    TUNNEL_PORT: Number;
    SSH_TUNNEL: String;
    NODEPORT: Object;
    STATUS: String;
}

let Tunnels: Tunnel[];

const getTunnels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let rawResponse;
        rawResponse = await k8sApi.listNamespacedPod('whiplash').then((res: any) => {
            return res.body.items;
        });
    Tunnels = [];
    let i=0;
    for (const tunnel of rawResponse) {
        if (tunnel.metadata.labels.SSH_TUNNEL) {
            let NODEPORT = 0;
            try { 
                NODEPORT = await k8sApi.readNamespacedService(tunnel.metadata.labels.SSH_TUNNEL, 'whiplash').then((res: any) => {
                    return res.body.spec.ports[0].nodePort;
                });
            } catch {}
            let data: Tunnel = {
                // net.connect{port: tunnel.metadata.labels.REMOTE_PORT}
                REMOTE_HOST: tunnel.metadata.labels.REMOTE_HOST,
                REMOTE_PORT: tunnel.metadata.labels.REMOTE_PORT,
                TUNNEL_HOST: tunnel.metadata.labels.TUNNEL_HOST,
                TUNNEL_PORT: tunnel.metadata.labels.TUNNEL_PORT,
                SSH_TUNNEL: tunnel.metadata.labels.SSH_TUNNEL,
                TUNNEL_USER: tunnel.metadata.labels.TUNNEL_USER,
                NODEPORT: NODEPORT,
                STATUS: tunnel.status.containerStatuses[0].ready,
                
            }
            Tunnels = [...Tunnels, data];
            Tunnels[i];
            i++;
        }
    }
    return res.status(200).json({
        response:  Tunnels 
   });
} catch {
    return res.status(200).json({
        response:  null 
   });
}


};

const getTunnel = async (req: Request, res: Response, next: NextFunction) => {

};

const updateTunnel = async (req: Request, res: Response, next: NextFunction) => {

};

const deleteTunnel = async (req: Request, res: Response, next: NextFunction) => {
    /**
     * delete a Service
     * @param name name of the Service
     * @param namespace object name and auth scope, such as for teams and projects
     * @param pretty If \&#39;true\&#39;, then the output is pretty printed.
     * @param dryRun When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed
     * @param gracePeriodSeconds The duration in seconds before the object should be deleted. Value must be non-negative integer. The value zero indicates delete immediately. If this value is nil, the default grace period for the specified type will be used. Defaults to a per object value if not specified. zero means delete immediately.
     * @param orphanDependents Deprecated: please use the PropagationPolicy, this field will be deprecated in 1.7. Should the dependent objects be orphaned. If true/false, the \&quot;orphan\&quot; finalizer will be added to/removed from the object\&#39;s finalizers list. Either this field or PropagationPolicy may be set, but not both.
     * @param propagationPolicy Whether and how garbage collection will be performed. Either this field or OrphanDependents may be set, but not both. The default policy is decided by the existing finalizer set in the metadata.finalizers and the resource-specific default policy. Acceptable values are: \&#39;Orphan\&#39; - orphan the dependents; \&#39;Background\&#39; - allow the garbage collector to delete the dependents in the background; \&#39;Foreground\&#39; - a cascading policy that deletes all dependents in the foreground.
     * @param body 
     * public async deleteNamespacedService (name: string, namespace: string, pretty?: string, dryRun?: string, gracePeriodSeconds?: number, orphanDependents?: boolean, propagationPolicy?: string, body?: V1DeleteOptions, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: V1Service;  }> {
     */
     /**
     * delete a Pod
     * @param name name of the Pod
     * @param namespace object name and auth scope, such as for teams and projects
     * @param pretty If \&#39;true\&#39;, then the output is pretty printed.
     * @param dryRun When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed
     * @param gracePeriodSeconds The duration in seconds before the object should be deleted. Value must be non-negative integer. The value zero indicates delete immediately. If this value is nil, the default grace period for the specified type will be used. Defaults to a per object value if not specified. zero means delete immediately.
     * @param orphanDependents Deprecated: please use the PropagationPolicy, this field will be deprecated in 1.7. Should the dependent objects be orphaned. If true/false, the \&quot;orphan\&quot; finalizer will be added to/removed from the object\&#39;s finalizers list. Either this field or PropagationPolicy may be set, but not both.
     * @param propagationPolicy Whether and how garbage collection will be performed. Either this field or OrphanDependents may be set, but not both. The default policy is decided by the existing finalizer set in the metadata.finalizers and the resource-specific default policy. Acceptable values are: \&#39;Orphan\&#39; - orphan the dependents; \&#39;Background\&#39; - allow the garbage collector to delete the dependents in the background; \&#39;Foreground\&#39; - a cascading policy that deletes all dependents in the foreground.
     * @param body 
     * public async deleteNamespacedPod (name: string, namespace: string, pretty?: string, dryRun?: string, gracePeriodSeconds?: number, orphanDependents?: boolean, propagationPolicy?: string, body?: V1DeleteOptions, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: V1Pod;  }>
     */
    try {
        let tunnel = req.params.tunnel;
        await k8sApi.deleteNamespacedPod(tunnel, "whiplash", false, undefined, 2); 
        await k8sApi.deleteNamespacedService(tunnel, "whiplash"); 
        return res.status(200).json({
           response: tunnel + " delete requested"
       });
    } catch {
        return res.status(200).json({
            response: null
        });
    }

};

const addTunnel = async (req: Request, res: Response, next: NextFunction) => {
    /**
     * create a Pod
     * @param namespace object name and auth scope, such as for teams and projects
     * @param body 
     * @param pretty If \&#39;true\&#39;, then the output is pretty printed.
     * @param dryRun When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed
     * @param fieldManager fieldManager is a name associated with the actor or entity that is making these changes. The value must be less than or 128 characters long, and only contain printable characters, as defined by https://golang.org/pkg/unicode/#IsPrint.
     * @param fieldValidation fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields, provided that the &#x60;ServerSideFieldValidation&#x60; feature gate is also enabled. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23 and is the default behavior when the &#x60;ServerSideFieldValidation&#x60; feature gate is disabled. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default when the &#x60;ServerSideFieldValidation&#x60; feature gate is enabled. - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered.
     * public async createNamespacedPod (namespace: string, body: V1Pod, pretty?: string, dryRun?: string, fieldManager?: string, fieldValidation?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: V1Pod;  }>
    */
    try {
        let longUuid = uuidv4();
        let uuid = longUuid.substr(0, longUuid.indexOf('-'));
        const REMOTE_HOST = req.body.REMOTE_HOST?.toString();
        const REMOTE_PORT = req.body.REMOTE_PORT?.toString();
        const TUNNEL_HOST = req.body.TUNNEL_HOST?.toString();
        const TUNNEL_PORT = req.body.TUNNEL_PORT?.toString();
        const TUNNEL_USER = req.body.TUNNEL_USER?.toString();
        const SSH_TUNNEL = "ssh-tunnel-"+uuid;
        let pod = await k8sApi.createNamespacedPod("whiplash", 
        {
            "apiVersion": "v1",
            "kind": "Pod",
            "metadata": {
            "labels": {
                "REMOTE_HOST": REMOTE_HOST,
                "REMOTE_PORT": REMOTE_PORT,
                "TUNNEL_HOST": TUNNEL_HOST,
                "TUNNEL_PORT": TUNNEL_PORT,
                "SSH_TUNNEL": SSH_TUNNEL,
                "app": "whiplash-ssh-tunnel",
                "io.whiplash.service": SSH_TUNNEL
            },
            "name": SSH_TUNNEL,
            "namespace": "whiplash"
            },
            "spec": {
            "volumes": [
                {
                "name": "ssh-key",
                "secret": {
                    "secretName": "ssh-master",
                    "defaultMode": parseInt('0600',8)
                }
                }
            ],
            "containers": [
                {
                "env": [
                    {
                        "name": "KEY",
                        "value": "/root/id_rsa"
                    },
                    {
                        "name": "TUNNEL_USER",
                        "value": TUNNEL_USER
                    },
                    {
                        "name": "LOCAL_PORT",
                        "value": REMOTE_PORT
                    },
                    {
                        "name": "REMOTE_HOST",
                        "value": REMOTE_HOST
                    },
                    {
                        "name": "REMOTE_PORT",
                        "value": REMOTE_PORT
                    },
                    {
                        "name": "TUNNEL_HOST",
                        "value": TUNNEL_HOST
                    },
                    {
                        "name": "TUNNEL_PORT",
                        "value": TUNNEL_PORT
                    }
                ],
                "image": "nowsci/sshtunnel",
                "imagePullPolicy": "Always",
                "name": "sshtunnel",
                "ports": 
                    {
                    "containerPort": REMOTE_PORT,
                    "protocol": "TCP"
                    }
                ,
                "volumeMounts": [
                    {
                    "mountPath": "/root/.ssh/",
                    "name": "ssh-key",
                    "readOnly": true
                    }
                ]
                }
            ]
            }
        });
        /**
         * create a Service
         * @param namespace object name and auth scope, such as for teams and projects
         * @param body 
         * @param pretty If \&#39;true\&#39;, then the output is pretty printed.
         * @param dryRun When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed
         * @param fieldManager fieldManager is a name associated with the actor or entity that is making these changes. The value must be less than or 128 characters long, and only contain printable characters, as defined by https://golang.org/pkg/unicode/#IsPrint.
         * @param fieldValidation fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields, provided that the &#x60;ServerSideFieldValidation&#x60; feature gate is also enabled. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23 and is the default behavior when the &#x60;ServerSideFieldValidation&#x60; feature gate is disabled. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default when the &#x60;ServerSideFieldValidation&#x60; feature gate is enabled. - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered.
         * public async createNamespacedService (namespace: string, body: V1Service, pretty?: string, dryRun?: string, fieldManager?: string, fieldValidation?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: V1Service;  }> 
         */
        let service = await k8sApi.createNamespacedService("whiplash", 
        {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {
            "labels": {
                "app": "whiplash-ssh-tunnel",
                "io.whiplash.service": SSH_TUNNEL
            },
            "name": SSH_TUNNEL,
            "namespace": "whiplash"
            },
            "spec": {
            "ports": [
                {
                "name": REMOTE_PORT,
                "port": Number(REMOTE_PORT),
                "targetPort": Number(REMOTE_PORT)
                }
            ],
            "type": "NodePort",
            "selector": {
                "io.whiplash.service": SSH_TUNNEL
            }
            }
        });

        return res.status(200).json({
            pod: pod,
            service: service
        });
    } catch(err) {
        console.log(err);
        return res.status(200).json({
            response: null
        });
    }
};

export default { getTunnels, getTunnel, updateTunnel, deleteTunnel, addTunnel };