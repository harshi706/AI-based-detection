"use client";

import { load as cocoSSDLoad } from '@tensorflow-models/coco-ssd';
import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import { renderPredictions } from '@/utils/render';

let detectInterval;

const Object = () => {
    const webcamRef = useRef(null);
    const canvasRef=useRef(null);
    const [loading, setLoading] = useState(true);

    const runCoco = async () => {
        setLoading(true);
        const net = await cocoSSDLoad();
        setLoading(false);

        detectInterval = setInterval(() => {
            runObjectDetection(net);
        }, 10);
    };
    async function runObjectDetection(net){
        if(canvasRef.current && webcamRef.current !== null && webcamRef.current.video?.readyState === 4){
            canvasRef.current.width = webcamRef.current.video.videoWidth;
            canvasRef.current.height = webcamRef.current.video.videoHeight;

            //detect objects
            const detectedObjects=await net.detect(
                webcamRef.current.video,
                undefined,
                0.6
            );
          //  console.log(detectedObjects)
          const context=canvasRef.current.getContext("2d");
          renderPredictions(detectedObjects,context);
        }
    }

    const visibleVideo = () => {
        if (webcamRef.current !== null && webcamRef.current.video?.readyState === 4) {
            const myVideoWidth = webcamRef.current.video.videoWidth;
            const myVideoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = myVideoWidth;
            webcamRef.current.video.height = myVideoHeight;
        }
    };

    useEffect(() => {
        runCoco();
        visibleVideo();

        // Clean up the interval when the component unmounts
        return () => clearInterval(detectInterval);
    }, []);

    return (
        <div className='mt-8'>
            {loading ? (
                <div className='gradient-title'>Loading AI Model...</div>
            ) : (
                <div className='relative flex justify-center items-center gradient p-1.5 rounded-md'>
                    <Webcam
                        ref={webcamRef}
                        className='lg:h-[720px] rounded-md w-full'
                        muted
                    />
                    <canvas ref={canvasRef}
                    className='absolute top-0 left-0 z-99999 w-full lg:h-[720px]'

                    />
                </div>
            )}
        </div>
    );
};

export default Object;
