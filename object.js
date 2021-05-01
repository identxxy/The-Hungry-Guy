import { objectMaterial } from './texture';
import * as THREE from 'three'


const mouthOpenThreshold = 5;
const objDefaultLifeTimeMs = 6000;
const objDefaultTakenTimeMs = 4000;

const objConfigDict = {
    'box': {
        geometry: new THREE.BoxGeometry(10, 10, 10),
        score: 10,
        size: 6
    }
}

export class GameObject extends Physijs.SphereMesh{
    constructor(levelObj){
        const name = levelObj.name;
        const config = objConfigDict[name];
        super(new THREE.SphereGeometry(config.size, 8, 8), new THREE.MeshBasicMaterial({opacity: 0.0, transparent:true}));
        const visualMesh = new THREE.Mesh(config.geometry, objectMaterial(name));
        this.add(visualMesh);
        if (Object.keys(objConfigDict).indexOf(name) === -1){
            console.error('invalid object name:', name, 'at GameObject constructor');
        }
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
                this.position.z = 0;
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
                break;
            case 'right':
                giveVel.x = -5;
                giveVel.y = 5;
                giveVel.z = -5;
                break;
            case 'up':
                giveVel.x = 0;
                giveVel.y = 0;
                giveVel.z = 0;
                this.constraint.setLimits(-100, 200, -100, 100);
                this.constraint.setRestitution(1.0, 0.5);
                break;
            case 'down':
                giveVel.x = 0;
                giveVel.y = 0;
                giveVel.z = -10;
                this.constraint.setLimits(-100, 400, -100, 100);
                this.constraint.setRestitution(0, 0.5);
                break;
        }
        this.setLinearVelocity( giveVel.multiplyScalar(myMeter) );
        this.setAngularVelocity( new THREE.Vector3(Math.random(), Math.random(), Math.random()) );
    }

    take(){
        this.takenAway = true;
        let takeVel = new THREE.Vector3();
        if (this.type == "up"){
            takeVel.y = 50;
        }
        else if (this.type == "down"){
            takeVel.z = 50;
        }
        this.setLinearVelocity( takeVel.multiplyScalar(myMeter) );
    }

    canBeEaten(mouth){
        if (!mouth || this.isEaten)
            return false;
        const zdist = mouth.up[2] - this.position.z;
        const ymax = mouth.up[1];
        const ymin = mouth.low[1];
        const xmax = mouth.right[0];
        const xmin = mouth.left[0];
        if (ymax - ymin > mouthOpenThreshold &&
            ymax > this.position.y && ymin < this.position.y &&
            xmax > this.position.x && xmin < this.position.x &&
            (zdist > - 20 || zdist < 20 )
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

