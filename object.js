import { ObjectMaterial } from './texture';

const mouthOpenThreshold = 5;
const objDefaultLifeTimeMs = 10000;
const objDefaultTakenTimeMs = 5000;

const geo_dict = {
    'box': new THREE.BoxGeometry(10, 10, 10)
}

const score_dict = {
    'box': 10
}

export class GameObject extends Physijs.BoxMesh{
    constructor(levelObj){
        const name = levelObj.name;
        super(geo_dict[name], ObjectMaterial(name));
        if (Object.keys(geo_dict).indexOf(name) === -1){
            console.error('invalid object name:', name, 'at GameObject constructor');
        }
        // read from file
        this.name = levelObj.name;
        this.spawnTime = levelObj.spawnTime;
        this.type = levelObj.type;

        // implied
        this.score = score_dict[name];
        switch (this.type)
        {
            case 'left':
                this.position.x = -300;
                this.position.y = 100;
                this.position.z = 100;
                break;
            case 'right':
                this.position.x = 300;
                this.position.y = 100;
                this.position.z = 100;
                break;
            case 'up':
                this.position.x = 0;
                this.position.y = 300;
                this.position.z = 100;
                break;
            case 'down':
                this.position.x = 0;
                this.position.y = -100;
                this.position.z = 300;
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

    give(){
        let giveVel = new THREE.Vector3();
        switch (this.type)
        {
            case 'left':
                giveVel.x = 10;
                giveVel.y = 5;
                giveVel.z = -5;
                break;
            case 'right':
                giveVel.x = -10;
                giveVel.y = 5;
                giveVel.z = -5;
                break;
            case 'up':
                giveVel.x = 0;
                giveVel.y = -5;
                giveVel.z = 0;
                break;
            case 'down':
                giveVel.x = 0;
                giveVel.y = 0;
                giveVel.z = -5;
                break;
        }
        this.setLinearVelocity( giveVel.multiplyScalar(myMeter) );
        this.setAngularVelocity( new THREE.Vector3(Math.random(), Math.random(), Math.random()) );
    }

    take(){
        this.takenAway = true;
        let takeVel = new THREE.Vector3();
        if (this.type == "up"){
            console.log("take away up obj");
        }
        else if (this.type == "down"){
            console.log("take away down obj");
        }
        this.setLinearVelocity( takeVel.multiplyScalar(myMeter) );
    }

    canBeEaten(mouth){
        if (!mouth || this.isEaten)
            return false;
        const ymax = mouth.up[1];
        const ymin = mouth.low[1];
        const xmax = mouth.right[0];
        const xmin = mouth.left[0];
        if (ymax - ymin > mouthOpenThreshold &&
            ymax > this.position.y && ymin < this.position.y &&
            xmax > this.position.x && xmin < this.position.x ){
            return true;
        }
        return false;
    }
    
    canBeTaken(timeElasped){
        if ( !this.takenAway || this.type == "left " || this.type == "right" )
            return false;
        return (timeElasped - this.spawnTime > this.takenTime);
    }

    canBeRemoved(timeElasped){
        if (this.position.x < -400 ||
            this.position.x > 400  ||
            this.position.y < -400 ||
            this.position.y > 400  ||
            timeElasped - this.spawnTime > this.lifeTime
            )
            return true;
        return false;
    }
}

