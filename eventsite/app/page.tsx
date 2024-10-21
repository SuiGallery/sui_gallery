'use client'
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import { Button } from "../components/ui/button";

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useCallback, useRef } from "react";
import { createEvent,getEvents, Event } from "@/contract";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";


export default function Home() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [event, setEvent] = useState<string>("");
  const [designStyle, setDesignStyle] = useState<string>("classic");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const clientRef = useRef(new SuiClient({ url: getFullnodeUrl('testnet') }));

  const handleCreateEvent = async () => {
    if (!event || !designStyle || !currentAccount?.address) {
      alert("Please fill in all fields and connect your wallet");
      return;
    }
    setIsLoading(true);
    try {
      const tx = await createEvent(event, 1000000000);
      await signAndExecuteTransaction({
        transaction: tx,
      }, {
        onSuccess: (result) => {
          console.log("Transaction successful:", result);
          handleGetEvents();
          setEvent(""); // Clear the input field after successful creation
        },
        onError: (error) => {
          console.error("Transaction failed:", error);
          alert("Failed to create event. Please try again.");
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error in handleCreateEvent:', error);
      alert(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }

  const handleGetEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedEvents = await getEvents(clientRef.current);
      console.log('Fetched events:', fetchedEvents);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Failed to fetch events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetEvents();
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-500 to-fuchsia-500 min-h-screen p-4 flex flex-col items-center">
      <Card className="w-full max-w-4xl mb-4" key={events.length}>
        <div className="flex flex-col items-start flex-grow overflow-hidden space-y-4 pb-4">
          <div className="w-full flex justify-between items-center p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Event Photo Booth</h1>
            <ConnectButton />
          </div>
          <div className="w-full flex-col items-start justify-start px-8 space-y-4">
            <p className="text-lg font-semibold">Event Name</p>
            <Input type="text" placeholder="Event Name" value={event} onChange={(e) => setEvent(e.target.value)} />
          </div>
          <div className="w-full flex-col items-start justify-start px-8 space-y-4">
            <p className="text-lg font-semibold">Choose Design Style</p>
            <RadioGroup
              onValueChange={(value) => {
                setDesignStyle(value);
              }}
              value={designStyle}
            >
              <div className="flex flex-row gap-4">
                <RadioGroupItem value="classic" id="r1" />
                <Label>Classic - Elegant and timeless</Label>
              </div>
              <div className="flex flex-row gap-4">
                <RadioGroupItem value="modern" id="r2" />
                <Label>Modern - Sleek and minimalistic</Label>
              </div>
              <div className="flex flex-row gap-4">
                <RadioGroupItem value="retro" id="r3" />
                <Label>Retro - Nostalgic and vintage</Label>
              </div>
              <div className="flex flex-row gap-4">
                <RadioGroupItem value="futuristic" id="r4" />
                <Label>Futuristic - Bold and futuristic</Label>
              </div>
            </RadioGroup>
            <Button className="w-full" onClick={handleCreateEvent}>
              Create Event
            </Button>
          </div>
        </div>
      </Card>

      <Card className="w-full max-w-4xl" key={`events-${events.length}`}>
        <div className="w-full flex-col items-start justify-start p-8 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">Events</p>
            <Button onClick={handleGetEvents} disabled={isLoading}>
              Refresh Events
            </Button>
          </div>
          {isLoading ? (
            <p>Loading events...</p>
          ) : events.length > 0 ? (
            <>
              <p>Number of events: {events.length}</p>
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between space-y-4">
                  <p>{event.name}</p>
                  <Button>
                    <a href={`https://${event.b36addr}.walrus.site`} target="_blank" rel="noopener noreferrer">
                      View Event
                    </a>
                  </Button>
                </div>
              ))}
            </>
          ) : (
            <p>No events found.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
