import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Clarifai from 'clarifai'
import { API_KEY } from '../secret'
import './style.css'

const app = new Clarifai.App({
  apiKey: API_KEY
})

// Overlaid on faces
const overlay = '😍'

class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imgInfo: {
        b64: '',
        clarifaiFaces: [],
        realFaces: []
      }
    }
    this.canvasRef = React.createRef(null)
  }

  // Draw a HTML Canvas and make it the the same size as the image
  drawBoxes = () => {
    console.log('Start draw boxes on canvas')
    const { imgInfo } = this.state
    const newImgInfo = imgInfo
    const image = new Image();
    const ctx = this.canvasRef.getContext('2d')
    image.onload = () => {
      ctx.drawImage(image, 0, 0, imgInfo.width, imgInfo.height)
      // const ctx = canvas.getContext('2d')
      ctx.textBaseline = 'top'

      // For each bounding box we calculate the 'real' coordinates (x, y, width, height) of the faces and push the overlay emoji on top of it
      if (newImgInfo.clarifaiFaces) {
        for (let i = 0; i < newImgInfo.clarifaiFaces.length; i++) {
          const box = {
            x: newImgInfo.clarifaiFaces[i].left_col * newImgInfo.width,
            y: newImgInfo.clarifaiFaces[i].top_row * newImgInfo.height,
            w: (newImgInfo.clarifaiFaces[i].right_col * newImgInfo.width) - (newImgInfo.clarifaiFaces[i].left_col * newImgInfo.width),
            h: (newImgInfo.clarifaiFaces[i].bottom_row * newImgInfo.height) - (newImgInfo.clarifaiFaces[i].top_row * newImgInfo.height)
          }
          newImgInfo.realFaces.push(box)
          ctx.beginPath()
          ctx.rect(box.x, box.y, box.w, box.h)
          ctx.lineWidth = 4
          ctx.strokeStyle = 'blue'
          ctx.closePath()
          ctx.stroke()

          ctx.fillStyle = "white"
          ctx.textBaseline = 'middle'
          ctx.font = (box.w * 0.9) + 'px monospace'
          ctx.fillText(overlay, box.x + (box.w / 12), box.y + (box.h / 1.75))

          this.setState({
            imgInfo: newImgInfo
          })
        }
      }
    }
    image.crossOrigin = "anonymous"
    image.src = imgInfo.b64
  }

  // Face detection alpha model and pushes the bounding boxes to imgInfo.clarifaiFaces
  faceDetection = (b64Img) => {
    console.log('Start face detection')
    const { imgInfo } = this.state
    const newImgInfo = imgInfo
    app.models.predict('a403429f2ddf4b49b307e318f00e528b', {
      base64: b64Img
    }).then(
      (res) => {
        const data = res.outputs[0].data.regions
        if (data !== null) {
          for (let i = 0; i < data.length; i++) {
            newImgInfo.clarifaiFaces.push(data[i].region_info.bounding_box)
          }
        }
        this.setState({
          imgInfo: newImgInfo
        }, () => this.drawBoxes())
      },
      (err) => {
        console.log(err)
      }
    )
  }

  // When there's an image in the input, grab the file and do the following:
  // 1. Convert image to Base-64 and store in imgInfo.b64
  // 2. Populate the image tag with the Base-64 string
  // 3. Create a copy of the Base-64 string which can be sent to Clarifai in imgInfo.b64Clarifai
  imageUpload = (e) => {
    console.log('Start uploading image')
    const { imgInfo } = this.state
    const newImgInfo = imgInfo
    const files = Array.from(e.target.files)
    if (files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        newImgInfo.b64 = e.target.result
        newImgInfo.b64Clarifai = newImgInfo.b64.replace(/^data:image\/(.*);base64,/, '')
        this.setState({
          imgInfo: newImgInfo
        }, () => this.faceDetection(newImgInfo.b64Clarifai))
      }
      reader.readAsDataURL(files[0])
    }
  }

  onLoadImg = ({ target:img }) => {
    const { imgInfo } = this.state
    const newImgInfo = imgInfo
    newImgInfo.width = img.offsetWidth
    newImgInfo.height = img.offsetHeight

    this.setState({
      imgInfo: newImgInfo
    })
  }

  render () {
    const { imgInfo } = this.state

    return (<div className='home'>
      <div className='input-group'>
        <label htmlFor='image'>Choose an image</label>
        <input type='file' id='image' onChange={this.imageUpload} />
      </div>
      <div className='face-results'>
        <div className='col'>
          <img src={imgInfo.b64} onLoad={this.onLoadImg} />
        </div>
        <div className='col'>
          Faces detected: {imgInfo.realFaces ? imgInfo.realFaces.length : 0}
          <canvas id='canvas' ref={canvasRef => this.canvasRef = canvasRef} width={imgInfo.width} height={imgInfo.height} />
        </div>
      </div>
    </div>)
  }
}

ReactDOM.render(<Home />, document.querySelector('#root'))
