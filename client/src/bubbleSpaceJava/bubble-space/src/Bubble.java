import static java.lang.Math.sqrt;

import java.util.ArrayList;

public class Bubble {
	private static final int[] SIZES = {0,1,2,3,4,5,6};//corresponds to radius 2,3,4,5,6,6-shadow
	private static ArrayList<int[][]> shadows = new ArrayList<int[][]>();

	/**
	 * int[y][x]
	 * 0---------->x
	 * |..........
	 * |..........
	 * |..........
	 * |..........
	 * v y
	 */
	public static final int[][] MOVES = {
			{0,-1}, {-1,-1}, {1,-1}, 
			{-1,0}, {1,0}, 
			{0, 1}, {-1, 1}, {1, 1}
	};
	/**
	 * int[size][move number][points][2]
	 */
	private static int[][][][] moveCover = new int[SIZES.length][MOVES.length][][];
	private static int[][][][] moveRelease = new int[SIZES.length][MOVES.length][][];
	public final int id;
	private int size;
	public int[] pos;
	static{
		for(int n=0; n<SIZES.length;n++){//for each size once and for all
			int r = SIZES[n]+3;
			int[][] shadow = new int[(2*r+1)][2*r+1];
			int x = 0;
			int y = 0;
			for(int j = y-r; j < y+r+1; j++){ //from y-r to y+r there are 2*r+1 grids right? 
				for(int i = x-r; i<x+r+1; i++){
					if(!(sqrt((i-x)*(i-x)+(j-y)*(j-y))>r)){
						shadow[r+i][r+j]=1;
					}
				}
			}
			printArray(shadow);
			shadows.add(readCoords(shadow, r, r));			
			for(int m=0; m<MOVES.length; m++){
				int[] move = MOVES[m];
				int[][] cover = new int[2*r+1][2*r+1];
				int[][] release = new int[2*r+1][2*r+1];
				for(int j=0; j<(2*r+1); j++){
					for(int i=0; i<(2*r+1); i++){
						if(shadow[j][i]==1 && ((i+move[0]>2*r||i+move[0]<0)
								||(j+move[1]>2*r||j+move[1]<0)
								||(shadow[j+move[1]][i+move[0]]==0))){
							cover[j][i]=1;
						}
						if(shadow[j][i]==1 && ((i-move[0]>2*r||i-move[0]<0)
							||(j-move[1]>2*r||j-move[1]<0)
							||(shadow[j-move[1]][i-move[0]]==0))){
							release[j][i]=-1;
						}
					}
				}
				//System.out.println("("+move[0]+","+move[1]+")");
				/*if(m==0){
					printArray(cover);
					printArray(release);
				}*/
				//
				moveCover[n][m]=readCoords(cover, r-move[0],r-move[1]);
				moveRelease[n][m]=readCoords(release, r,r);
			}
		}
	}
	
	public Bubble(int id, int size){
		this.id = id;
		this.size = size;
	}
	
	public int[][] getShadow(){
		return shadows.get(size);
	}
	public int[][] getShadow(boolean larger){
		if(larger){
			return shadows.get(size+2);
		}
		return shadows.get(size);
	}
	
	public int[][] getMoveCover(int move){
		return moveCover[this.size][move];
	}
	
	public int[][] getMoveRelease(int move){
		return moveRelease[this.size][move];
	}
	
	public String toString(){
		String ret = "Bubble #"+id+":\n size: "+size+"\n";
		//ret += " shadow: ";
		ret += String.format("at (%d,%d)", pos[0], pos[1]);
		/*int[][] shadow = shadows.get(size);
		for(int i = 0; i<shadow.length; i++){ 		
			if(i%(size*4)==0)ret += "\n";
			ret += "("+shadow[i][0]+","+shadow[i][1]+")";	//+","+shadow[i][2]+"...		
		}*/
		return ret;
	}
	
	public static void printArray(int[][] arr){
		String out = "";
		for(int y=0; y<arr.length; y++){
			for(int x=0; x<arr[0].length; x++){
				out+=arr[y][x]+" ";
			}
			out+="\n";
		}
		System.out.println(out);
	}
	public static int[][] readCoords(int[][] chart, int offsetX, int offsetY){
		int count = 0;
		for(int i=0; i<chart.length; i++){
			for(int j=0; j<chart[0].length; j++){
				if(chart[i][j]!=0){
					count++;
				}
			}
		}
		int[][] pts = new int[count][2];
		count=0;
		for(int i=0; i<chart.length; i++){
			for(int j=0; j<chart[0].length; j++){
				if(chart[i][j]!=0){
					pts[count][0]=j-offsetX;
					pts[count][1]=i-offsetY;
					count++;
				}
			}
		}
		return pts;
	}
	
	public static void main(String[] args) {
		Bubble b1 = new Bubble(1, 1);	
		Bubble b2 = new Bubble(0, 3);
		System.out.println(b1);
		System.out.println(b2);
	}
}
