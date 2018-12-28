package bubbleSpaceJava;

import java.awt.BorderLayout;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Scanner;

import javax.swing.ImageIcon;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;

public class BubbleSpace extends JFrame{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static final int width = 150;
	private int height = 150;
	private static final int GRID_SIZE = 5;
	private int[][] space;
	private ArrayList<Bubble> bubbleList = new ArrayList<Bubble>();
	
	private JPanel panel = new JPanel();
	
	public BubbleSpace(int[] bubbleSizes){
		super("Bubble Space");
		this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);  
		//TODO calculate minimum height.
		space = new int[width][height];
		int lastX=0, lastY=0;
		for(int size : bubbleSizes){
			Bubble b = new Bubble((int)(Math.random()*500), size);
			int[] pos = putBubble(b, lastX, lastY);
			if(pos[0]>0){
				lastX = Math.min(width, pos[0]+4);
				lastY = Math.min(height, pos[1]+4);
				//lastX = pos[0];
				//lastY = pos[1];
			}
			
		}
		panel.setPreferredSize(new Dimension(width*GRID_SIZE,height*GRID_SIZE));
		JScrollPane scr = new JScrollPane(panel);
		scr.setPreferredSize(new Dimension(800,800));
		Container con = this.getContentPane();
	    con.setLayout(new BorderLayout());    
	    con.add(scr);
	    this.pack();
	    this.setVisible(true);
	}
	private int[] putBubble(Bubble b, int startX, int startY) {
		// TODO Auto-generated method stub
		int[][] shadow = b.getShadow();
		int[] xy = new int[2];
		xy[0] = -1;
		for(int i=startX+startY*width; i<width*height; i++){
			int x = i%width;
			int y = i/width;
			boolean vacant = true;
			for(int[] pt : b.getShadow(true) ){
				if((!(pt[0]+x>=0 && pt[0]+x<width 
						&& pt[1]+y>=0 && pt[1]+y<height) 
						|| space[pt[0]+x][pt[1]+y]!=0)){
					//this (x,y) doesn't work
					vacant=false;
					break;
				}
			}
			if(vacant){
				for(int[] pt : shadow ){
					//if((pt[0]!=0||pt[1]!=0)){
						space[pt[0]+x][pt[1]+y]=b.id;
					//}
				}
				xy[0]=x;
				xy[1]=y;
				b.pos=xy;
				System.out.println(b.id + " is placed at ("+x+","+y+")");
				bubbleList.add(b);
				break;
			}			
		}
		return xy;
		
	}
	
	public void display(){
		BufferedImage draft = new BufferedImage(width,height,BufferedImage.TYPE_INT_ARGB);
		BufferedImage display = new BufferedImage(width*GRID_SIZE,height*GRID_SIZE,BufferedImage.TYPE_INT_ARGB);
		int pixels[] = new int[width*height];
		for(int i=0; i<width*height; i++){
			int x = i%width;
			int y = i/width;
			if(space[x][y]!=0){
				pixels[i] = (0xff << 24)|(0x59 << 16)|(0xae<<8)|(space[x][y]*100);
						
			}
		}
		draft.getRaster().setDataElements(0, 0, width, height, pixels);
		Graphics2D g2d = (Graphics2D) display.getGraphics();
		g2d.drawImage(draft, 0, 0, display.getWidth(), display.getHeight(), null);
		g2d.dispose();
		JLabel pic = new JLabel(new ImageIcon(display));
		panel.removeAll();
		panel.add(pic);
		panel.revalidate();
		panel.repaint();	
		
	}
	
	public String toString(){
		String ret = "------------------Bubble Space--------------";
		for(int i = 0; i<space.length; i++){ 		
			for(int j = 0; j<space[0].length; j++){ 		
				ret+=space[i][j]+" ";					
			}	
			ret+="\n";
		}
		return ret;
	}
	
	private void startPhysics() {
		System.out.println("start");
		Collections.shuffle(bubbleList);
		for(Bubble b:bubbleList){
			for(int i=0; i<=4; i++){//only moves towards the top
				int[] move = Bubble.MOVES[i];
				if(!pointsAreOccupied(b.getMoveCover(i), b.pos)){
					System.out.println(b);
					System.out.println(
							"Moved it with move: ("+move[0]+", "+move[1]+")");
					release(b.getMoveRelease(i), b.pos);
					cover(b.getMoveCover(i), b.pos, b.id);
					b.pos[0] = b.pos[0]+move[0];
					b.pos[1] = b.pos[1]+move[1];
					break;
				}
			}
		}
		this.display();
	}
	
	private boolean pointsAreOccupied(int[][] pts, int[] offset) {
		int x = offset[0];
		int y = offset[1];
		for(int[] pt : pts ){
			if(//(pt[0]!=0||pt[1]!=0) && 
					(!(pt[0]+x>=0 && pt[0]+x<width 
					&& pt[1]+y>=0 && pt[1]+y<height) 
					|| space[pt[0]+x][pt[1]+y]!=0)){
				//this (x,y) doesn't work
				return true;
				
			}
		}
		return false;
	}
	
	private void release(int[][] pts, int[] offset) {
		int x = offset[0];
		int y = offset[1];
		for(int[] pt : pts ){
			space[pt[0]+x][pt[1]+y]=0;
		}
	}
	private void cover(int[][] pts, int[] offset, int id) {
		int x = offset[0];
		int y = offset[1];
		for(int[] pt : pts ){
			//if((pt[0]!=0||pt[1]!=0)){
				space[pt[0]+x][pt[1]+y]=id;
			//}
		}
	}

	public static void main(String[] args) {
		int[] a = new int[40];
		for(int i=0; i<a.length; i++){
			a[i] = (int)(Math.random()*5);
		}
		BubbleSpace bsp = new BubbleSpace(a);
		bsp.display();
		Scanner sc = new Scanner(System.in);
		//boolean start = false;&&!start
		while(sc.hasNextLine()){
			String input = sc.nextLine();
			if(input.trim().equals("s")){
				bsp.startPhysics();
			//}else if(input.trim().equals("end")&&start){
				//bsp.endPhysics();
			}else if(input.indexOf(",")!=-1){
				String[] params = input.split(",");
				try{
					bsp.putBubble(new Bubble(1, Integer.parseInt(params[0])), 
							Integer.parseInt(params[1]), 
							Integer.parseInt(params[2]));
					bsp.display();
				}catch(NumberFormatException e){
					e.printStackTrace();
				}
			}
		}
		sc.close();
	}
}
