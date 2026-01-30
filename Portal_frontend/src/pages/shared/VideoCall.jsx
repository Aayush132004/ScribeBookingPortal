import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  StreamVideo, 
  StreamCall, 
  SpeakerLayout, 
  CallControls,
  useCalls
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useStreamClient } from '../../hooks/useStreamClient';
import { Loader2, PhoneOff } from 'lucide-react';

const VideoCall = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { video: client } = useStreamClient();
  const [call, setCall] = useState(null);

  useEffect(() => {
    if (!client || !requestId) return;

    const callInstance = client.call('default', `exam-${requestId}`);
    callInstance.join({ create: true })
      .then(() => setCall(callInstance))
      .catch(err => console.error("Failed to join call:", err));

    return () => {
      if (callInstance) callInstance.leave();
    };
  }, [client, requestId]);

  if (!call) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="font-bold text-slate-600">Initializing Secure Video Link...</p>
    </div>
  );

  return (
    <div className="h-[80vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <SpeakerLayout />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <CallControls onLeave={() => navigate(-1)} />
          </div>
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

export default VideoCall;