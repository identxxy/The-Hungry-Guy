import { getGameOBJ } from './loader';
import * as THREE from 'three'


const mouthOpenThreshold = 5;
const objDefaultLifeTimeMs = 6000;
const objDefaultTakenTimeMs = 4000;

const objConfigDict = {
    'apple': {
        score: 10,
        size: 6
    },
    'banana': {
        score: 10,
        size: 6
    },
    'jelly': {
        score: 10,
        size: 6
    },
    'pancake': {
        score: 10,
        size: 6
    },
    'watermelon': {
        score: 10,
        size: 6
    },
    'chicken': {
        score: 10,
        size: 6
    },
    'egg': {
        score: 10,
        size: 6
    },
    'wrench': {
        score: -20,
        size: 6
    },
    'iphone': {
        score: -10,
        size: 6
    },
    'rose': {
        score: -10,
        size: 6
    },
    'knife': {
        score: -20,
        size: 6
    },
    'cap': {
        score: -10,
        size: 6
    },
}

export class GameObject extends Physijs.SphereMesh{
    constructor(levelObj){
        const name = levelObj.name;
        const config = objConfigDict[name];
        const mtr = Physijs.createMaterial(
            new THREE.MeshBasicMaterial({ opacity: 0.0, transparent: true }),
            0.2,
            0.2
        );
        super(new THREE.SphereGeometry(config.size, 8, 8), mtr);
        this.visualMesh = new THREE.Object3D();
        let group = getGameOBJ(name);
        group.children.forEach((element) => { this.visualMesh.add(element.clone()); });
        this.visualMesh.scale.set(group.scale.x, group.scale.y, group.scale.z);
        if (Object.keys(objConfigDict).indexOf(name) === -1){
            console.error('invalid object name:', name, 'at GameObject constructor');
        }
        this.add(this.visualMesh);
        // read from file
        this.name = name;
        this.spawnTime = levelObj.spawnTime;
        this.type = levelObj.type;

        // implied
        this.score = config.score;
        switch (this.type){
            case 'left':
                this.position.x = -300;
                this.position.y = 100;
                this.position.z = 200;
                break;
            case 'right':
                this.position.x = 300;
                this.position.y = 100;
                this.position.z = 200;
                break;
            case 'up':
                this.position.x = 0;
                this.position.y = 200;
                this.position.z = 40;
                break;
            case 'down':
                this.position.x = 0;
                this.position.y = -100;
                this.position.z = 400;
                break;
            default:
                console.error("wrong obj type!!");
        }

        // fixed
        this.isEaten = false;

        // optional
        this.lifeTime = levelObj.lifeTime || objDefaultLifeTimeMs;
        // only for up and down obj
        this.takenTime = levelObj.takenTime || objDefaultTakenTimeMs;
    }

    addConstraint(){
        if (this.type == 'up'){
            this.constraint = new Physijs.SliderConstraint(
                this,
                new THREE.Vector3(this.position.x, this.position.y, this.position.z),
                new THREE.Vector3(0,0,-Math.PI/2)
            );
        }
        else if (this.type == 'down'){
            this.constraint = new Physijs.SliderConstraint(
                this,
                new THREE.Vector3(this.position.x, this.position.y, this.position.z),
                new THREE.Vector3(Math.PI/2,0,0)
            );
        }
        return this.constraint;
    }

    give(){
        let giveVel = new THREE.Vector3();
        switch (this.type)
        {
            case 'left':
                giveVel.x = 5;
                giveVel.y = 5;
                giveVel.z = -5;
                this.setAngularVelocity( new THREE.Vector3(Math.random(), Math.random(), Math.random()) );
                break;
            case 'right':
                giveVel.x = -5;
                giveVel.y = 5;
                giveVel.z = -5;
                this.setAngularVelocity( new THREE.Vector3(Math.random(), Math.random(), Math.random()) );
                break;
            case 'up':
                giveVel.x = 0;
                giveVel.y = 0;
                giveVel.z = 0;
                this.constraint.setLimits(-100, 200, -100, 100);
                this.constraint.setRestitution(1.0, 0.5);
                this.setAngularVelocity( new THREE.Vector3(Math.random(), Math.random(), Math.random()) );
                break;
            case 'down':
                giveVel.x = 0;
                giveVel.y = 0;
                giveVel.z = -15;
                this.constraint.setLimits(-100, 370, -100, 100);
                this.constraint.setRestitution(0, 0.5);
                this.setAngularVelocity( new THREE.Vector3(0, Math.random(), 0) );
                break;
        }
        this.setLinearVelocity( giveVel.multiplyScalar(myMeter) );
    }

    take(){
        this.takenAway = true;
        let takeVel = new THREE.Vector3();
        if (this.type == "up"){
            takeVel.y = 100;
        }
        else if (this.type == "down"){
            takeVel.z = 50;
        }
        this.setLinearVelocity( takeVel.multiplyScalar(myMeter) );
    }

    canBeEaten(mouth){
        if (!mouth || this.isEaten)
            return false;
        const zdist = this.position.z;
        const ymax = mouth.up[1];
        const ymin = mouth.low[1];
        const xmax = mouth.right[0];
        const xmin = mouth.left[0];
        if (ymax - ymin > mouthOpenThreshold &&
            ymax > this.position.y && ymin < this.position.y &&
            xmax > this.position.x && xmin < this.position.x &&
            zdist < 50 
            ){
            return true;
        }
        return false;
    }
    
    canBeTaken(timeElasped){
        if ( this.type == "left " || this.type == "right" )
            return false;
        return (!this.takenAway && timeElasped - this.spawnTime > this.takenTime);
    }

    canBeRemoved(timeElasped){
        if (this.position.y > 300 ||
            timeElasped - this.spawnTime > this.lifeTime)
            return true;
        return false;
    }
}

